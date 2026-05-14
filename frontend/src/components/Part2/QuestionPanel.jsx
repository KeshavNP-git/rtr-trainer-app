import { useMemo, useState } from 'react'
import Timer from './Timer'
import AnswerReveal from './AnswerReveal'
import styles from './QuestionPanel.module.css'

export default function QuestionPanel({
  scenario,
  currentQuestion,
  currentIdx,
  totalQuestions,
  onNext,
  onPrevious,
  onAnswerAttempt,
  attemptedAnswers
}) {
  const [revealedByQuestionId, setRevealedByQuestionId] = useState(() => new Set())

  const handleOK = () => {
    if (currentQuestion) {
      onAnswerAttempt(currentQuestion.id, currentQuestion.answer)
      setRevealedByQuestionId(prev => new Set([...prev, currentQuestion.id]))
    }
  }

  if (!currentQuestion) return <div>No question loaded</div>

  const isRevealed = revealedByQuestionId.has(currentQuestion.id)
  const isAnswered = attemptedAnswers[currentQuestion.id]
  const answerRevealKey = useMemo(() => currentQuestion.id, [currentQuestion.id])

  return (
    <div className={styles.questionPanel}>
      <div className={styles.timerArea}>
        <Timer />
      </div>

      <div className={styles.progressArea}>
        <span className={styles.questionNumber}>
          Question {currentIdx + 1} of {totalQuestions}
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.questionContent}>
        <h2 className={styles.questionText}>{currentQuestion.prompt}</h2>

        <div className={styles.categoryBadge}>
          <span>{currentQuestion.category}</span>
        </div>
      </div>

      <div className={styles.answerSection}>
        <AnswerReveal
          key={answerRevealKey}
          answer={currentQuestion.answer}
          isRevealed={isRevealed}
          onReveal={() => setRevealedByQuestionId(prev => new Set([...prev, currentQuestion.id]))}
        />
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.btnPrevious}
          onClick={onNext}
        >
          Skip
        </button>

        <button 
          className={styles.btnOK}
          onClick={handleOK}
        >
          Next →
        </button>
      </div>

      {isAnswered && (
        <div className={styles.attemptedBanner}>
          ✓ Question attempted - {attemptedAnswers[currentQuestion.id]}
        </div>
      )}
    </div>
  )
}
