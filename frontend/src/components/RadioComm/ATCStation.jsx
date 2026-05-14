import React, { useState, useEffect, useRef } from 'react';
import styles from './ATCStation.module.css';
import ScenarioViewer from './ScenarioViewer';
import PTTControl from './PTTControl';

export default function ATCStation({ socket, displayName, sessionId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transmissions, setTransmissions] = useState([]);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [readbacks, setReadbacks] = useState([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [remoteTransmitting, setRemoteTransmitting] = useState(false);
  const audioRecorderRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', (data) => {
      setOtherUserOnline(data.users.pilot !== null);
      setTransmissions(prev => [...prev, {
        type: 'system',
        message: `${data.displayName} (${data.role}) joined`,
        timestamp: new Date(),
      }]);
    });

    socket.on('user-left', (data) => {
      setOtherUserOnline(false);
      setTransmissions(prev => [...prev, {
        type: 'system',
        message: `${data.displayName} disconnected`,
        timestamp: new Date(),
      }]);
    });

    socket.on('transmission-received', (data) => {
      setTransmissions(prev => [...prev, {
        type: 'transmission',
        from: data.speaker,
        role: data.role,
        text: data.text,
        timestamp: data.timestamp,
      }]);
    });

    socket.on('readback-received', (data) => {
      setReadbacks(prev => [...prev, {
        from: data.from,
        text: data.readbackText,
        timestamp: data.timestamp,
      }]);
      setTransmissions(prev => [...prev, {
        type: 'readback',
        from: data.from,
        text: data.readbackText,
        timestamp: data.timestamp,
      }]);
    });

    // Track remote (pilot) PTT state for header indicator
    socket.on('ptt-start', (data) => {
      if (data.role !== 'atc') setRemoteTransmitting(true);
    });
    socket.on('ptt-end', (data) => {
      if (data.role !== 'atc') setRemoteTransmitting(false);
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('transmission-received');
      socket.off('readback-received');
      socket.off('ptt-start');
      socket.off('ptt-end');
    };
  }, [socket]);

  const handleRecordStart = async () => {
    setIsRecording(true);
  };

  const handleRecordStop = async () => {
    setIsRecording(false);
  };

  // Determine header status label
  const headerStatus = isTransmitting
    ? 'tx'
    : remoteTransmitting
    ? 'rx'
    : null;

  return (
    <div className={styles.atcStation}>
      <div className={`${styles.header} ${headerStatus === 'tx' ? styles.headerTx : headerStatus === 'rx' ? styles.headerRx : ''}`}>
        <h2>🛂 ATC Station</h2>
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
            <span>PILOT SPEAKING</span>
          </div>
        )}

        <div className={styles.status}>
          {otherUserOnline ? (
            <span className={styles.online}>🟢 Pilot Online</span>
          ) : (
            <span className={styles.offline}>🔴 Pilot Offline</span>
          )}
        </div>
      </div>

      <div className={styles.mainPanel}>
        <div className={styles.transmissionLog}>
          <h3>Transmission Log</h3>
          <div className={styles.logContent}>
            {transmissions.map((trans, idx) => (
              <div key={idx} className={styles[trans.type]}>
                {trans.type === 'system' && (
                  <span className={styles.systemMsg}>{trans.message}</span>
                )}
                {trans.type === 'transmission' && (
                  <div className={styles.transmissionItem}>
                    <span className={styles.speaker}>{trans.from}</span>
                    <span className={styles.text}>{trans.text}</span>
                    <span className={styles.time}>{new Date(trans.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
                {trans.type === 'readback' && (
                  <div className={styles.readbackItem}>
                    <span className={styles.label}>📝 Readback from {trans.from}:</span>
                    <span className={styles.text}>{trans.text}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <ScenarioViewer socket={socket} userRole="atc" sessionId={sessionId} />

        <PTTControl
          socket={socket}
          sessionId={sessionId}
          userRole="atc"
          displayName={displayName}
          otherUserOnline={otherUserOnline}
          onTransmitChange={setIsTransmitting}
        />
      </div>

      <div className={styles.sessionInfo}>
        Session: {sessionId} | Role: ATC
      </div>
    </div>
  );
}
