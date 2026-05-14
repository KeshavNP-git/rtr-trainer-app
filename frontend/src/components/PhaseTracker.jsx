import styles from './PhaseTracker.module.css'

export default function PhaseTracker({ phases = [], currentPhase = 0 }) {
  return (
    <div className={styles.track}>
      {phases.map((ph, i) => {
        const done = i < currentPhase
        const cur  = i === currentPhase
        return (
          <div
            key={i}
            className={`${styles.item} ${done ? styles.done : cur ? styles.current : ''}`}
          >
            <div className={`${styles.dot} ${done ? styles.dotDone : cur ? styles.dotCur : styles.dotTodo}`} />
            <div className={styles.label}>{ph}</div>
            {done && <span className={styles.check}>✓</span>}
          </div>
        )
      })}
    </div>
  )
}
