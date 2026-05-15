import React, { useState, useEffect, useRef } from 'react';
import styles from './PTTControl.module.css';
import PTTAudioManager from '../utils/PTTAudioManager';
import WaveformVisualizer from './WaveformVisualizer';

export default function PTTControl({ socket, sessionId, userRole, displayName, otherUserOnline, onTransmitChange }) {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micFrequencies, setMicFrequencies] = useState([]);
  const [remoteTransmitting, setRemoteTransmitting] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState('');
  const [remoteFrequencies, setRemoteFrequencies] = useState([]);
  const [speakerVolume, setSpeakerVolume] = useState(100);
  const [micVolume, setMicVolume] = useState(100);
  const pttManagerRef = useRef(null);
  const pttButtonRef = useRef(null);

  useEffect(() => {
    // Initialize PTT Audio Manager
    const manager = new PTTAudioManager(socket, userRole, sessionId);
    manager.initAudio().then((success) => {
      if (success) {
        console.log('[PTT] Audio system initialized');
      }
    });
    pttManagerRef.current = manager;

    // Listen for remote transmission start
    socket.on('ppt-start', (data) => {
      if (data.role !== userRole) {
        setRemoteTransmitting(true);
      }
    });

    // Listen for audio chunks from other user
    socket.on('ppt-audio', (data) => {
      if (data.from !== userRole && pttManagerRef.current) {
        pttManagerRef.current.playAudioChunk(
          data.audioData,
          setRemoteFrequencies  // Pass callback for playback frequency monitoring
        );
      }
    });

    // Listen for remote transmission end
    socket.on('ppt-end', (data) => {
      if (data.role !== userRole) {
        setRemoteTransmitting(false);
        setRemoteFrequencies([]);  // Clear frequencies when transmission ends
      }
    });

    // Receive user info
    socket.on('user-joined', (data) => {
      const otherRole = userRole === 'atc' ? 'pilot' : 'atc';
      if (data.users[otherRole]) {
        setRemoteUserName(data.users[otherRole]);
      }
    });

    return () => {
      socket.off('ppt-start');
      socket.off('ppt-audio');
      socket.off('ppt-end');
      socket.off('user-joined');
      if (pttManagerRef.current) {
        pttManagerRef.current.stop();
      }
    };
  }, [socket, userRole, sessionId]);

  const handlePTTMouseDown = async () => {
    if (!otherUserOnline) return;
    if (pttManagerRef.current) {
      await pttManagerRef.current.startTransmit((data) => {
        if (typeof data === 'object' && data.frequencies) {
          setMicLevel(data.level);
          setMicFrequencies(data.frequencies);
        } else {
          // Fallback for old format
          setMicLevel(data);
        }
      });
      setIsTransmitting(true);
      onTransmitChange && onTransmitChange(true);
    }
  };

  const handlePTTMouseUp = () => {
    if (pttManagerRef.current) {
      pttManagerRef.current.stopTransmit();
    }
    setIsTransmitting(false);
    setMicLevel(0);
    setMicFrequencies([]);
    onTransmitChange && onTransmitChange(false);
  };

  const handlePTTTouchStart = async (e) => {
    e.preventDefault();
    if (!otherUserOnline) return;
    if (pttManagerRef.current) {
      await pttManagerRef.current.startTransmit((data) => {
        if (typeof data === 'object' && data.frequencies) {
          setMicLevel(data.level);
          setMicFrequencies(data.frequencies);
        } else {
          // Fallback for old format
          setMicLevel(data);
        }
      });
      setIsTransmitting(true);
      onTransmitChange && onTransmitChange(true);
    }
  };

  const handlePTTTouchEnd = (e) => {
    e.preventDefault();
    if (pttManagerRef.current) {
      pttManagerRef.current.stopTransmit();
    }
    setIsTransmitting(false);
    setMicLevel(0);
    setMicFrequencies([]);
    onTransmitChange && onTransmitChange(false);
  };

  return (
    <div className={styles.pttControl}>

      {/* ── LIVE STATUS BANNER ── */}
      <div className={`${styles.liveBanner} ${
        isTransmitting ? styles.liveBannerTx :
        remoteTransmitting ? styles.liveBannerRx :
        styles.liveBannerStandby
      }`}>
        {isTransmitting ? (
          <>
            <span className={styles.onAirDot}></span>
            <span className={styles.onAirLabel}>ON AIR</span>
            {/* Real-time reactive waveform for transmission */}
            <WaveformVisualizer 
              frequencyData={micFrequencies}
              isActive={isTransmitting}
              barCount={6}
              color="red"
            />
            <span className={styles.bannerText}>🎤 MIC ACTIVE — {displayName}</span>
            {/* Reverse waveform for symmetry */}
            <WaveformVisualizer 
              frequencyData={micFrequencies}
              isActive={isTransmitting}
              barCount={6}
              color="red"
            />
          </>
        ) : remoteTransmitting ? (
          <>
            <span className={styles.rxDot}></span>
            {/* Real-time reactive waveform for receiving */}
            <WaveformVisualizer 
              frequencyData={remoteFrequencies}
              isActive={remoteTransmitting}
              barCount={6}
              color="cyan"
            />
            <span className={styles.bannerText}>📡 RECEIVING — {remoteUserName || 'Other Station'}</span>
            {/* Reverse waveform for symmetry */}
            <WaveformVisualizer 
              frequencyData={remoteFrequencies}
              isActive={remoteTransmitting}
              barCount={6}
              color="cyan"
            />
            <span className={styles.rxDot}></span>
          </>
        ) : (
          <>
            <span className={styles.standbyDot}></span>
            <span className={styles.bannerText}>— STANDBY — Ready to transmit</span>
          </>
        )}
      </div>

      <div className={styles.transmissionStatus}>
        {isTransmitting ? (
          <div className={styles.transmittingBox}>
            <div className={styles.transmittingIndicator}>
              <span className={styles.pulse}></span>
              <span className={styles.pulse}></span>
              <span className={styles.pulse}></span>
            </div>
            <div>
              <div className={styles.label}>🎤 TRANSMITTING</div>
              <div className={styles.callsign}>{displayName}</div>
            </div>
          </div>
        ) : remoteTransmitting ? (
          <div className={styles.receivingBox}>
            <div className={styles.receivingIndicator}>
              📡
            </div>
            <div>
              <div className={styles.label}>📍 RECEIVING</div>
              <div className={styles.callsign}>{remoteUserName || 'Other User'}</div>
            </div>
          </div>
        ) : (
          <div className={styles.stanbyBox}>
            <div className={styles.standbyIndicator}>⊘</div>
            <div>
              <div className={styles.label}>STANDBY</div>
              <div className={styles.callsign}>Ready to transmit</div>
            </div>
          </div>
        )}
      </div>

      {/* Microphone Level Indicator */}
      {isTransmitting && (
        <div className={styles.micLevelBar}>
          <div className={styles.label}>Mic Level</div>
          <div className={styles.levelContainer}>
            <div
              className={styles.levelFill}
              style={{ width: `${micLevel}%` }}
            ></div>
          </div>
          <div className={styles.levelText}>{Math.round(micLevel)}%</div>
        </div>
      )}

      {/* PTT Button */}
      <button
        ref={pttButtonRef}
        className={`${styles.pttButton} ${isTransmitting ? styles.active : ''} ${
          !otherUserOnline ? styles.disabled : ''
        }`}
        onMouseDown={handlePTTMouseDown}
        onMouseUp={handlePTTMouseUp}
        onMouseLeave={handlePTTMouseUp}
        onTouchStart={handlePTTTouchStart}
        onTouchEnd={handlePTTTouchEnd}
        disabled={!otherUserOnline}
      >
        <span className={styles.icon}>🎤</span>
        <span className={styles.text}>PRESS & TALK</span>
        <span className={styles.hint}>Hold to transmit</span>
      </button>

      {!otherUserOnline && (
        <div className={styles.warning}>
          ⚠️ Waiting for other user to connect...
        </div>
      )}

      {/* Volume Controls */}
      <div className={styles.volumeControls}>
        <div className={styles.volumeControl}>
          <label>🔊 Speaker</label>
          <input
            type="range"
            min="0"
            max="100"
            value={speakerVolume}
            onChange={(e) => {
              const vol = parseInt(e.target.value);
              setSpeakerVolume(vol);
              if (pttManagerRef.current) {
                pttManagerRef.current.setSpeakerVolume(vol);
              }
            }}
            className={styles.volumeSlider}
          />
          <span className={styles.volumeValue}>{speakerVolume}%</span>
        </div>

        <div className={styles.volumeControl}>
          <label>🎙️ Microphone</label>
          <input
            type="range"
            min="0"
            max="100"
            value={micVolume}
            onChange={(e) => {
              const vol = parseInt(e.target.value);
              setMicVolume(vol);
              if (pttManagerRef.current) {
                pttManagerRef.current.setMicVolume(vol);
              }
            }}
            className={styles.volumeSlider}
          />
          <span className={styles.volumeValue}>{micVolume}%</span>
        </div>
      </div>
    </div>
  );
}
