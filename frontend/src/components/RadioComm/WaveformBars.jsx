import React, { useEffect, useRef } from 'react';
import styles from './WaveformBars.module.css';

/**
 * Animated waveform bars that respond to audio level
 * Shows 5 animated bars that scale based on current audio level
 */
export function WaveformBars({ level = 0, isActive = false }) {
  const barsRef = useRef([]);

  useEffect(() => {
    if (!isActive) {
      barsRef.current = [0, 0, 0, 0, 0];
      return;
    }

    // Distribute level across bars with some variance
    const heights = [
      Math.random() * (level * 0.7),
      Math.random() * (level * 0.9),
      level,
      Math.random() * (level * 0.85),
      Math.random() * (level * 0.6),
    ];
    barsRef.current = heights;
  }, [level, isActive]);

  return (
    <div className={styles.waveformContainer}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${styles.bar} ${isActive ? styles.active : ''}`}
          style={{
            height: `${Math.max(5, barsRef.current[i] || 0)}%`,
          }}
        />
      ))}
    </div>
  );
}
