/**
 * RadioComm — PTT (Push-To-Talk) Aviation Radio
 * Press and hold (or click) the big PTT button to speak
 * Release to stop transmitting - NO CHAT, CLEAN UI, BIG FONTS
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { WaveformBars } from './RadioComm/WaveformBars';
import styles from './RadioComm.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || undefined;

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

const STATE = {
  SETUP: 'setup',
  CONNECTING: 'connecting',
  WAITING: 'waiting',
  CALLING: 'calling',
  CONNECTED: 'connected',
  ERROR: 'error',
};

export default function RadioComm() {
  const [appState, setAppState] = useState(STATE.SETUP);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('pilot');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [peerName, setPeerName] = useState('');
  const [peerRole, setPeerRole] = useState('');
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [remoteIsPTTActive, setRemoteIsPTTActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micPerm, setMicPerm] = useState('unknown');
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [localLevel, setLocalLevel] = useState(0);
  const [remoteLevel, setRemoteLevel] = useState(0);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const mySocketIdRef = useRef(null);
  const peerSocketIdRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const analyserLocalRef = useRef(null);
  const analyserRemoteRef = useRef(null);
  const audioCtxRef = useRef(null);
  const callTimerRef = useRef(null);
  const levelAnimRef = useRef(null);

  const startLevelMonitoring = useCallback(() => {
    const tick = () => {
      if (analyserLocalRef.current && isPTTActive) {
        const data = new Uint8Array(analyserLocalRef.current.frequencyBinCount);
        analyserLocalRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLocalLevel(Math.min(100, (avg / 128) * 100));
      }
      if (analyserRemoteRef.current && remoteIsPTTActive) {
        const data = new Uint8Array(analyserRemoteRef.current.frequencyBinCount);
        analyserRemoteRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setRemoteLevel(Math.min(100, (avg / 128) * 100));
      }
      levelAnimRef.current = requestAnimationFrame(tick);
    };
    levelAnimRef.current = requestAnimationFrame(tick);
  }, [isPTTActive, remoteIsPTTActive]);

  const setupLocalAnalyser = useCallback((stream) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const source = ctx.createMediaStreamSource(stream);
    analyserLocalRef.current = ctx.createAnalyser();
    analyserLocalRef.current.fftSize = 256;
    source.connect(analyserLocalRef.current);
  }, []);

  const setupRemoteAnalyser = useCallback((stream) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const source = ctx.createMediaStreamSource(stream);
    analyserRemoteRef.current = ctx.createAnalyser();
    analyserRemoteRef.current.fftSize = 256;
    source.connect(analyserRemoteRef.current);
  }, []);

  const handlePTTDown = useCallback(() => {
    if (appState !== STATE.CONNECTED) return;
    setIsPTTActive(true);
    socketRef.current?.emit('ptt-start', { roomId });
  }, [appState, roomId]);

  const handlePTTUp = useCallback(() => {
    setIsPTTActive(false);
    socketRef.current?.emit('ptt-stop', { roomId });
  }, [roomId]);

  useEffect(() => {
    if (appState !== STATE.CONNECTED) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPTTActive) handlePTTDown();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPTTActive) handlePTTUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [appState, isPTTActive, handlePTTDown, handlePTTUp]);

  const createPeerConnection = useCallback((targetSocketId) => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(e => console.warn(e));
        setupRemoteAnalyser(event.streams[0]);
      }
      setAppState(STATE.CONNECTED);
      setConnectionQuality('good');
      callTimerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      startLevelMonitoring();
    };

    // Optimize for low latency
    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'connected') {
        const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          const params = sender.getParameters();
          if (params.encodings) {
            params.encodings.forEach(encoding => {
              encoding.scaleResolutionDownBy = 1;
            });
            sender.setParameters(params);
          }
        }
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId) {
        socketRef.current?.emit('webrtc-ice', {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionQuality('good');
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        setError('Connection failed');
        setAppState(STATE.ERROR);
      }
    };

    return pc;
  }, [setupRemoteAnalyser, startLevelMonitoring]);

  const joinRoom = useCallback(async () => {
    if (!displayName.trim() || !roomId.trim()) {
      setError('Enter name and room');
      return;
    }

    if (socketRef.current) {
      disconnect();
    }

    setError('');
    setAppState(STATE.CONNECTING);

    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            latency: 0,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
          },
          video: false,
        });
        localStreamRef.current = stream;
        setupLocalAnalyser(stream);
        setMicPerm('granted');
      } catch (err) {
        setMicPerm('denied');
        setError('Microphone access denied');
        setAppState(STATE.SETUP);
        return;
      }
    }

    const socket = io(BACKEND_URL ?? undefined, {
      // ✅ FIX: polling first so Render can upgrade to WebSocket properly
      // Render (and most reverse proxies) need the HTTP handshake before WS upgrade
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      // ✅ FIX: needed when backend is on a different domain (Render vs Vercel)
      withCredentials: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      mySocketIdRef.current = socket.id;
      socket.emit('join-room', {
        roomId: roomId.trim(),
        displayName: displayName.trim(),
        role,
      });
    });

    socket.on('room-joined', ({ peers }) => {
      setAppState(STATE.WAITING);
      if (peers.length > 0) {
        const peer = peers[0];
        peerSocketIdRef.current = peer.socketId;
        isInitiatorRef.current = true;
        setPeerName(peer.displayName);
        setPeerRole(peer.role);
        setAppState(STATE.CALLING);
        initiateCall(peer.socketId, socket);
      }
    });

    socket.on('peer-joined', ({ socketId, displayName: peerDisplay, role: peerR }) => {
      peerSocketIdRef.current = socketId;
      isInitiatorRef.current = false;
      setPeerName(peerDisplay);
      setPeerRole(peerR);
      setAppState(STATE.CALLING);
    });

    socket.on('peer-left', () => {
      setPeerName('');
      setPeerRole('');
      peerSocketIdRef.current = null;
      setAppState(STATE.WAITING);
      setCallDuration(0);
      setRemoteIsPTTActive(false);
      clearInterval(callTimerRef.current);
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = null; }
    });

    socket.on('webrtc-offer', async ({ offer, fromSocketId, fromDisplayName }) => {
      peerSocketIdRef.current = fromSocketId;
      const pc = createPeerConnection(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetSocketId: fromSocketId, answer });
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc-ice', async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    socket.on('ptt-start', () => setRemoteIsPTTActive(true));
    socket.on('ptt-stop', () => setRemoteIsPTTActive(false));

    socket.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message);
      // FIX: Render free tier sleeps — backend can take 30s to wake. Don't hard crash.
      setError('Connecting to server... backend may be waking up (free tier). Wait 30s then retry.');
    });

    socket.on('reconnect_failed', () => {
      setError('Could not reach server. Check VITE_BACKEND_URL is set correctly on Vercel.');
      setAppState(STATE.ERROR);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        setAppState(STATE.SETUP);
      }
    });
  }, [displayName, roomId, role, setupLocalAnalyser, createPeerConnection]);

  const initiateCall = useCallback(async (targetSocketId, socket) => {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', { targetSocketId, offer, fromDisplayName: displayName });
  }, [createPeerConnection, displayName]);

  const disconnect = useCallback(() => {
    clearInterval(callTimerRef.current);
    cancelAnimationFrame(levelAnimRef.current);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setAppState(STATE.SETUP);
    setCallDuration(0);
    setPeerName('');
    setLocalLevel(0);
    setRemoteLevel(0);
    setIsPTTActive(false);
    setRemoteIsPTTActive(false);
  }, []);

  useEffect(() => {
    return () => disconnect()
  }, [disconnect]);

  const fmtDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (appState === STATE.SETUP || appState === STATE.ERROR) {
    return (
      <div className={styles.setupWrapper}>
        <div className={styles.setupContainer}>
          <div className={styles.setupHeader}>
            <div className={styles.radioIcon}>📻</div>
            <h1 className={styles.setupTitle}>RTR COMMUNICATION</h1>
            <p className={styles.setupSub}>PTT — Push To Talk</p>
          </div>

          {micPerm === 'denied' && (
            <div className={styles.errorBanner}>
              <p><strong>Microphone Blocked</strong></p>
              <p>Click 🔒 in address bar → Microphone → Allow</p>
            </div>
          )}

          {error && <div className={styles.errorBanner}><p>{error}</p></div>}

          <div className={styles.setupForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>YOUR NAME</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ROLE</label>
              <div className={styles.roleSelect}>
                <button
                  className={`${styles.roleBtn} ${role === 'pilot' ? styles.roleActive : ''}`}
                  onClick={() => setRole('pilot')}
                >
                  ✈️ PILOT
                </button>
                <button
                  className={`${styles.roleBtn} ${role === 'atc' ? styles.roleActive : ''}`}
                  onClick={() => setRole('atc')}
                >
                  🎙️ ATC
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ROOM</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="Room ID (e.g., flight-101)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
            </div>

            <button className={styles.joinBtn} onClick={joinRoom}>
              JOIN RADIO
            </button>
          </div>

          <div className={styles.setupFooter}>
            <p>🎤 Microphone must be allowed</p>
            <p>Press SPACEBAR or tap PTT button to transmit</p>
          </div>
        </div>
      </div>
    );
  }

  if (appState === STATE.WAITING || appState === STATE.CALLING) {
    return (
      <div className={styles.waitingWrapper}>
        <div className={styles.waitingContainer}>
          <h2 className={styles.waitingTitle}>
            {appState === STATE.WAITING ? '⏳ WAITING FOR PEER...' : '📡 CONNECTING...'}
          </h2>
          <p className={styles.waitingDesc}>Room: {roomId}</p>
          <div className={styles.spinner}></div>
          <button className={styles.disconnectBtn} onClick={disconnect}>
            DISCONNECT
          </button>
        </div>
      </div>
    );
  }

  if (appState === STATE.CONNECTED) {
    return (
      <div className={styles.connectedWrapper}>
        <div className={styles.remotePanel}>
          <div className={styles.remoteHeader}>
            <div className={styles.roleIcon}>{peerRole === 'atc' ? '🎙️' : '✈️'}</div>
            <div className={styles.remoteInfo}>
              <h2 className={styles.remoteName}>{peerName || 'Peer'}</h2>
              <p className={styles.remoteRole}>{peerRole?.toUpperCase()}</p>
            </div>
          </div>

          <div className={styles.remoteCenter}>
            {remoteIsPTTActive ? (
              <>
                <div className={styles.receivingBadge}>🔴 RECEIVING</div>
                <WaveformBars level={remoteLevel} isActive={true} />
              </>
            ) : (
              <div className={styles.standbyBadge}>🔵 STANDBY</div>
            )}
          </div>

          <div className={styles.remoteStats}>
            <p>Signal: <strong>{connectionQuality === 'good' ? '🟢 Good' : '🟡 Fair'}</strong></p>
            <p>Time: <strong>{fmtDuration(callDuration)}</strong></p>
          </div>
        </div>

        <audio ref={remoteAudioRef} autoPlay playsInline />

        <div className={styles.pttCenter}>
          <button
            className={`${styles.pttButton} ${isPTTActive ? styles.pttActive : ''}`}
            onMouseDown={handlePTTDown}
            onMouseUp={handlePTTUp}
            onMouseLeave={handlePTTUp}
            onTouchStart={handlePTTDown}
            onTouchEnd={handlePTTUp}
          >
            <span className={styles.pttText}>PTT</span>
          </button>

          <div className={styles.pttHint}>
            Press & Hold or Spacebar
          </div>

          <WaveformBars level={localLevel} isActive={isPTTActive} />
        </div>

        <div className={styles.localPanel}>
          <div className={styles.localHeader}>
            <div className={styles.roleIcon}>{role === 'atc' ? '🎙️' : '✈️'}</div>
            <div className={styles.localInfo}>
              <h2 className={styles.localName}>{displayName}</h2>
              <p className={styles.localRole}>{role.toUpperCase()}</p>
            </div>
          </div>

          <div className={styles.localCenter}>
            {isPTTActive ? (
              <>
                <div className={styles.transmittingBadge}>🔴 TRANSMITTING</div>
                <WaveformBars level={localLevel} isActive={true} />
              </>
            ) : (
              <div className={styles.standbyBadge}>🔵 STANDBY</div>
            )}
          </div>

          <button className={styles.disconnectBtn} onClick={disconnect}>
            END CALL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.setupWrapper}>
      <div className={styles.setupContainer}>
        <div className={styles.errorBanner}>
          <h2>⚠️ ERROR</h2>
          <p>{error}</p>
        </div>
        <button className={styles.joinBtn} onClick={() => { setAppState(STATE.SETUP); setError(''); }}>
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
