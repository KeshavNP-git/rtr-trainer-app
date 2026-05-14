import React, { useState, useEffect, useRef } from 'react';
import styles from './PilotStation.module.css';
import ScenarioViewer from './ScenarioViewer';
import PTTControl from './PTTControl';

export default function PilotStation({ socket, displayName, sessionId }) {
  const [isListening, setIsListening] = useState(true);
  const [isReadbacking, setIsReadbacking] = useState(false);
  const [transmissions, setTransmissions] = useState([]);
  const [atcOnline, setAtcOnline] = useState(false);
  const [currentTransmission, setCurrentTransmission] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [remoteTransmitting, setRemoteTransmitting] = useState(false);
  const audioRecorderRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', (data) => {
      setAtcOnline(data.users.atc !== null);
      setTransmissions(prev => [...prev, {
        type: 'system',
        message: `${data.displayName} (${data.role}) joined`,
        timestamp: new Date(),
      }]);
    });

    socket.on('user-left', (data) => {
      setAtcOnline(false);
      setTransmissions(prev => [...prev, {
        type: 'system',
        message: `${data.displayName} disconnected`,
        timestamp: new Date(),
      }]);
    });

    socket.on('transmission-active', (data) => {
      setCurrentTransmission({
        speaker: data.displayName || data.role,
        role: data.role,
        isActive: true,
      });
    });

    socket.on('transmission-received', (data) => {
      setCurrentTransmission(null);
      setTransmissions(prev => [...prev, {
        type: 'atc-transmission',
        from: data.speaker,
        text: data.text,
        timestamp: data.timestamp,
        id: data.id,
      }]);
    });

    socket.on('audio-stream', (data) => {
      // Play audio stream from ATC
      if (audioRef.current && isListening) {
        playAudioChunk(data.audioData);
      }
    });

    // Track remote (ATC) PTT state for header indicator
    socket.on('ptt-start', (data) => {
      if (data.role !== 'pilot') setRemoteTransmitting(true);
    });
    socket.on('ptt-end', (data) => {
      if (data.role !== 'pilot') setRemoteTransmitting(false);
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('transmission-active');
      socket.off('transmission-received');
      socket.off('audio-stream');
      socket.off('ptt-start');
      socket.off('ptt-end');
    };
  }, [socket, isListening]);

  const playAudioChunk = (base64Audio) => {
    try {
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const handleReadbackStart = async () => {
    if (!currentTransmission) return;
    
    setIsReadbacking(true);
    audioRecorderRef.current = new AudioRecorder(socket, 'pilot', sessionId);
    await audioRecorderRef.current.startRecording();
  };

  const handleReadbackStop = async () => {
    setIsReadbacking(false);
    if (audioRecorderRef.current) {
      const readbackText = await audioRecorderRef.current.stopRecording();
      if (readbackText) {
        socket.emit('readback', {
          transmissionId: currentTransmission?.id,
          readbackText,
        });
      }
    }
  };

  const lastTransmission = transmissions.find(t => t.type === 'atc-transmission');

  // Determine header status
  const headerStatus = isTransmitting ? 'tx' : remoteTransmitting ? 'rx' : null;

  return (
    <div className={styles.pilotStation}>
      <div className={`${styles.header} ${headerStatus === 'tx' ? styles.headerTx : headerStatus === 'rx' ? styles.headerRx : ''}`}>
        <h2>✈️ Pilot Station</h2>
        <div className={styles.callsign}>{displayName}</div>

        {/* Live radio indicator */}
        {headerStatus === 'tx' && (
          <div className={styles.liveIndicator}>
            <span className={styles.liveRedDot}></span>
            <span className={styles.liveBars}>
              <b style={{'--d':'0s'}}></b><b style={{'--d':'0.1s'}}></b><b style={{'--d':'0.2s'}}></b><b style={{'--d':'0.15s'}}></b>
            </span>
            <span>TRANSMITTING</span>
          </div>
        )}
        {headerStatus === 'rx' && (
          <div className={`${styles.liveIndicator} ${styles.liveRx}`}>
            <span className={styles.liveCyanDot}></span>
            <span className={styles.liveRxBars}>
              <b style={{'--d':'0s'}}></b><b style={{'--d':'0.12s'}}></b><b style={{'--d':'0.22s'}}></b><b style={{'--d':'0.1s'}}></b>
            </span>
            <span>ATC SPEAKING</span>
          </div>
        )}

        <div className={styles.status}>
          {atcOnline ? (
            <span className={styles.online}>🟢 ATC Online</span>
          ) : (
            <span className={styles.offline}>🔴 ATC Offline</span>
          )}
        </div>
      </div>

      <div className={styles.mainPanel}>
        <div className={styles.transmissionMonitor}>
          <h3>🔊 Current Transmission</h3>
          <div className={styles.displayBox}>
            {currentTransmission && currentTransmission.isActive ? (
              <div className={styles.activeTransmission}>
                <div className={styles.indicator}>🎙️</div>
                <div className={styles.speaker}>
                  {currentTransmission.speaker}
                  <span className={styles.role}>({currentTransmission.role.toUpperCase()})</span>
                </div>
                <div className={styles.waveform}>
                  <span>▌</span><span>▌▌</span><span>▌▌▌</span><span>▌▌▌▌</span><span>▌▌▌</span><span>▌▌</span><span>▌</span>
                </div>
              </div>
            ) : lastTransmission ? (
              <div className={styles.receivedTransmission}>
                <div className={styles.from}>{lastTransmission.from}</div>
                <div className={styles.text}>{lastTransmission.text}</div>
                <div className={styles.received}>✓ Received</div>
              </div>
            ) : (
              <div className={styles.waiting}>
                <p>Waiting for ATC transmission...</p>
                <p className={styles.hint}>Standby</p>
              </div>
            )}
          </div>
        </div>

        <ScenarioViewer socket={socket} userRole="pilot" sessionId={sessionId} />

        <PTTControl
          socket={socket}
          sessionId={sessionId}
          userRole="pilot"
          displayName={displayName}
          otherUserOnline={atcOnline}
          onTransmitChange={setIsTransmitting}
        />
      </div>

      <audio ref={audioRef} />

      <div className={styles.sessionInfo}>
        Session: {sessionId} | Role: PILOT
      </div>
    </div>
  );
}
