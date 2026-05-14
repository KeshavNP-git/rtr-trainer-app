import styles from './AnswerReveal.module.css'

export default function AnswerReveal({ answer, isRevealed, onReveal }) {
  return (
    <div className={styles.answerReveal}>
      <div className={styles.label}>Expected Answer:</div>
      
      <div 
        className={`${styles.answerText} ${isRevealed ? styles.revealed : ''}`}
        onClick={onReveal}
      >
        {answer}
      </div>

      {!isRevealed && (
        <div className={styles.hint}>
          📍 Tap to reveal answer
        </div>
      )}

      {isRevealed && (
        <div className={styles.revealedIndicator}>
          ✓ Revealed
        </div>
      )}
    </div>
  )
}
