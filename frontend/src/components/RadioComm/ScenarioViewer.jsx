import React, { useState, useEffect } from 'react';
import styles from './ScenarioViewer.module.css';
import { ifly2981Scenario } from '../../data/radioScenarios';

export default function ScenarioViewer({ socket, userRole, sessionId }) {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [currentTransmissionIdx, setCurrentTransmissionIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedPhases, setCompletedPhases] = useState([]);

  const scenario = ifly2981Scenario;
  const currentPhase = scenario.phases[currentPhaseIdx];
  const currentTransmission = currentPhase?.transmissions[currentTransmissionIdx];

  useEffect(() => {
    if (!isPlaying || !currentTransmission) return;

    const timer = setTimeout(() => {
      // Broadcast transmission to other user
      if (socket && currentTransmission.speaker !== 'SYSTEM') {
        socket.emit('scenario-transmission', {
          sessionId,
          phaseId: currentPhase.id,
          speaker: currentTransmission.speaker,
          role: currentTransmission.role,
          text: currentTransmission.text,
        });
      }

      // Move to next transmission
      if (currentTransmissionIdx < currentPhase.transmissions.length - 1) {
        setCurrentTransmissionIdx(currentTransmissionIdx + 1);
      } else if (currentPhaseIdx < scenario.phases.length - 1) {
        // Move to next phase
        setCompletedPhases([...completedPhases, currentPhaseIdx]);
        setCurrentPhaseIdx(currentPhaseIdx + 1);
        setCurrentTransmissionIdx(0);
      } else {
        // Scenario complete
        setIsPlaying(false);
      }
    }, (currentTransmission.duration || 3) * 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentTransmissionIdx, currentPhaseIdx, currentTransmission, socket, sessionId, completedPhases, userRole]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextPhase = () => {
    if (currentPhaseIdx < scenario.phases.length - 1) {
      setCompletedPhases([...completedPhases, currentPhaseIdx]);
      setCurrentPhaseIdx(currentPhaseIdx + 1);
      setCurrentTransmissionIdx(0);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhaseIdx > 0) {
      setCurrentPhaseIdx(currentPhaseIdx - 1);
      setCurrentTransmissionIdx(0);
      setCompletedPhases(completedPhases.slice(0, -1));
    }
  };

  const handleSkipToPhase = (idx) => {
    setCurrentPhaseIdx(idx);
    setCurrentTransmissionIdx(0);
  };

  return (
    <div className={styles.scenarioViewer}>
      <div className={styles.header}>
        <div className={styles.flightInfo}>
          <h3>{scenario.flightId}</h3>
          <p>{scenario.departure.name} → {scenario.arrival.name}</p>
          <p className={styles.aircraft}>{scenario.aircraft}</p>
        </div>
      </div>

      <div className={styles.phaseSelector}>
        <div className={styles.phases}>
          {scenario.phases.map((phase, idx) => (
            <button
              key={idx}
              className={`${styles.phaseBtn} ${
                idx === currentPhaseIdx ? styles.active : ''
              } ${completedPhases.includes(idx) ? styles.completed : ''}`}
              onClick={() => handleSkipToPhase(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.phaseDisplay}>
        <h2>{currentPhase?.title}</h2>
        <p className={styles.frequency}>📡 {currentPhase?.frequency}</p>

        <div className={styles.transmissionViewer}>
          <div className={styles.transcript}>
            {currentPhase?.transmissions.map((trans, idx) => (
              <div
                key={idx}
                className={`${styles.transmissionLine} ${
                  idx === currentTransmissionIdx ? styles.active : ''
                } ${trans.role === 'system' ? styles.system : ''} ${
                  trans.isReadback ? styles.readback : ''
                } ${trans.role === 'atc' ? styles.atcLine : ''} ${
                  trans.role === 'pilot' ? styles.pilotLine : ''
                }`}
              >
                <span className={styles.speaker}>{trans.speaker}:</span>
                <span className={styles.text}>{trans.text}</span>
              </div>
            ))}
          </div>

          {currentTransmission && (
            <div className={styles.currentDisplay}>
              <div className={`${styles.currentBox} ${
                currentTransmission.role === 'atc' ? styles.atcBox : ''
              } ${currentTransmission.role === 'pilot' ? styles.pilotBox : ''}`}>
                <div className={styles.speaker}>
                  {currentTransmission.speaker}
                </div>
                <div className={styles.text}>{currentTransmission.text}</div>
                <div className={styles.duration}>
                  ({currentTransmission.duration || 3}s)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.prevBtn}
          onClick={handlePrevPhase}
          disabled={currentPhaseIdx === 0}
        >
          ⏮ Prev Phase
        </button>

        <button
          className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
          onClick={handlePlayPause}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        <button
          className={styles.nextBtn}
          onClick={handleNextPhase}
          disabled={currentPhaseIdx === scenario.phases.length - 1}
        >
          Next Phase ⏭
        </button>
      </div>

      <div className={styles.progress}>
        Phase {currentPhaseIdx + 1} of {scenario.phases.length} | 
        Transmission {currentTransmissionIdx + 1} of {currentPhase?.transmissions.length}
      </div>
    </div>
  );
}
