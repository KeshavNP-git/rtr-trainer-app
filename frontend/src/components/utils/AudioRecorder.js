// Audio recording and transmission utility for radio communication

class AudioRecorder {
  constructor(socket, role, sessionId) {
    this.socket = socket;
    this.role = role;
    this.sessionId = sessionId;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
        
        // Send audio chunk in real-time
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result.split(',')[1];
          this.socket.emit('transmission-data', { audioChunk: base64Audio });
        };
        reader.readAsDataURL(event.data);
      };

      this.mediaRecorder.start(100); // Send chunks every 100ms
      this.isRecording = true;
      this.socket.emit('transmission-start', { role: this.role });

      console.log(`[AUDIO] Recording started for ${this.role}`);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access required for transmission');
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        
        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

        // Get final transcription or text
        const transmissionText = this.getTranscriptionFromAudio();
        
        console.log(`[AUDIO] Recording stopped. Text: "${transmissionText}"`);
        resolve(transmissionText);
      };

      this.mediaRecorder.stop();
    });
  }

  getTranscriptionFromAudio() {
    // This would ideally use Web Speech API or send to backend for transcription
    // For now, return a placeholder - integrate with Speech Recognition API
    return `[Transmission at ${new Date().toLocaleTimeString()}]`;
  }

  // Alternative: Use Web Speech API for real-time transcription
  async startWithTranscription() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not available');
      return this.startRecording();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let interimTranscript = '';
    let finalTranscript = '';

    recognition.onstart = () => {
      this.isRecording = true;
      console.log('[TRANSCRIPTION] Speech recognition started');
    };

    recognition.onresult = (event) => {
      interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Send interim text to socket for display
      if (interimTranscript || finalTranscript) {
        this.socket.emit('transmission-data', { 
          text: finalTranscript || interimTranscript 
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('[TRANSCRIPTION] Error:', event.error);
    };

    recognition.onend = () => {
      this.isRecording = false;
      console.log('[TRANSCRIPTION] Final text:', finalTranscript);
    };

    // Start recording and recognition
    await this.startRecording();
    recognition.start();
    this.recognition = recognition;
  }

  stopWithTranscription() {
    if (this.recognition) {
      this.recognition.stop();
    }
    return this.stopRecording();
  }
}

export default AudioRecorder;
