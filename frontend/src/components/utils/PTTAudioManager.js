// Real-time PTT Audio Streaming with WebRTC-like approach using WebSockets

class PTTAudioManager {
  constructor(socket, role, sessionId) {
    this.socket = socket;
    this.role = role;
    this.sessionId = sessionId;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
    this.isTransmitting = false;
    this.audioQueue = [];
    this.isPlaying = false;
    this.audioElements = [];
    this.micVolume = 100;
    this.speakerVolume = 100;
  }

  async initAudio() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);

      return true;
    } catch (err) {
      console.error('[PTT] Microphone access denied:', err);
      return false;
    }
  }

  async startTransmit(onAudioLevel) {
    if (this.isTransmitting) return;
    if (!this.stream) await this.initAudio();

    this.isTransmitting = true;
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 32000, // Lower bitrate for faster streaming
    });

    const audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        // Send immediately for real-time streaming
        this.sendAudioChunk(event.data);
      }
    };

    // Notify other user that transmission started
    this.socket.emit('ptt-start', {
      sessionId: this.sessionId,
      role: this.role,
    });

    this.mediaRecorder.start(50); // Collect chunks every 50ms for low latency

    // Monitor audio levels
    if (onAudioLevel) {
      const updateLevel = () => {
        if (!this.isTransmitting) return;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        onAudioLevel(Math.min(100, (average / 255) * 100));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    }
  }

  sendAudioChunk(audioBlob) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      this.socket.emit('ptt-audio', {
        sessionId: this.sessionId,
        from: this.role,
        audioData: base64Audio,
        timestamp: Date.now(),
      });
    };
    reader.readAsDataURL(audioBlob);
  }

  stopTransmit() {
    if (!this.isTransmitting) return;

    this.isTransmitting = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Notify other user transmission ended
    this.socket.emit('ptt-end', {
      sessionId: this.sessionId,
      role: this.role,
    });

    console.log('[PTT] Transmission ended');
  }

  playAudioChunk(base64Audio) {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/webm;codecs=opus' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio();
      audio.src = audioUrl;
      audio.volume = this.speakerVolume / 100;

      // Play immediately with no buffering
      audio.play().catch((err) => {
        console.error('[PTT] Audio playback error:', err);
      });

      // Clean up after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error('[PTT] Error playing audio:', err);
    }
  }

  setMicVolume(volume) {
    this.micVolume = Math.max(0, Math.min(100, volume));
    if (this.stream) {
      const audioTracks = this.stream.getAudioTracks();
      audioTracks.forEach((track) => {
        const settings = track.getSettings();
        if (settings && 'volume' in settings) {
          // Note: Not all browsers support setting volume directly
          console.log(`[PTT] Mic volume set to ${this.micVolume}%`);
        }
      });
    }
  }

  setSpeakerVolume(volume) {
    this.speakerVolume = Math.max(0, Math.min(100, volume));
  }

  stop() {
    this.stopTransmit();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default PTTAudioManager;
