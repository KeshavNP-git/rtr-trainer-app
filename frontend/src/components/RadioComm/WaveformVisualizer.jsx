import React, { useEffect, useRef, useState } from 'react';
import styles from './WaveformVisualizer.module.css';

/**
 * Real-time reactive waveform visualizer
 * Takes frequency data and renders dynamic bar heights
 */
export default function WaveformVisualizer({ 
  frequencyData = [], 
  isActive = false,
  direction = 'horizontal', // 'horizontal' or 'vertical'
  barCount = 8,
  color = 'red' // 'red' for transmit, 'cyan' for receive
}) {
  const canvasRef = useRef(null);
  const [bars, setBars] = useState(Array(barCount).fill(0));
  const barsRef = useRef(bars);

  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  useEffect(() => {
    if (!isActive || frequencyData.length === 0) {
      // Gradually fade out bars when inactive
      setBars(prev => prev.map(b => Math.max(0, b - 5)));
      return;
    }

    // Extract frequency data and create bar heights
    const binSize = Math.max(1, Math.floor(frequencyData.length / barCount));
    const newBars = [];

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < binSize && i * binSize + j < frequencyData.length; j++) {
        sum += frequencyData[i * binSize + j];
        count++;
      }
      const average = count > 0 ? sum / count : 0;
      const normalized = Math.min(100, (average / 255) * 150); // Amplify for visibility
      newBars.push(normalized);
    }

    setBars(newBars);
  }, [frequencyData, isActive, barCount]);

  const colorClass = color === 'cyan' ? styles.cyan : styles.red;

  if (direction === 'vertical') {
    return (
      <div className={`${styles.waveformVertical} ${isActive ? styles.active : ''}`}>
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`${styles.barVertical} ${colorClass}`}
            style={{
              height: `${Math.max(4, height)}px`,
              transition: 'height 0.05s ease-out'
            }}
          />
        ))}
      </div>
    );
  }

  // Horizontal layout (original)
  return (
    <div className={`${styles.waveformHorizontal} ${isActive ? styles.active : ''}`}>
      {bars.map((height, idx) => (
        <div
          key={idx}
          className={`${styles.barHorizontal} ${colorClass}`}
          style={{
            height: `${Math.max(4, height)}px`,
            transition: 'height 0.05s ease-out'
          }}
        />
      ))}
    </div>
  );
}
