import { useState, useEffect } from 'react'
import styles from './Timer.module.css'

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 30 * 60
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const isLow = timeLeft < 300 // Less than 5 minutes
  const isCritical = timeLeft < 60 // Less than 1 minute

  return (
    <div className={`${styles.timer} ${isLow ? styles.low : ''} ${isCritical ? styles.critical : ''}`}>
      <span className={styles.icon}>⏱</span>
      <span className={styles.time}>{timeString}</span>
    </div>
  )
}
