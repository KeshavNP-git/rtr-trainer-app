import { useState } from 'react'
import { PART1_QUESTIONS } from '../data/scenarios'
import styles from './Part1.module.css'

export default function Part1() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const question = PART1_QUESTIONS[currentIdx]

  const handleNext = () => {
    if (currentIdx < PART1_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handleSkip = () => {
    if (currentIdx < PART1_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const goToQuestion = (idx) => {
    setCurrentIdx(idx)
  }

  const progressDots = Array.from({ length: question.total }, (_, i) => (
    <div
      key={i}
      className={`${styles.dot} ${i < currentIdx ? styles.dotCompleted : i === currentIdx ? styles.dotCurrent : ''}`}
      onClick={() => goToQuestion(i)}
    />
  ))

  return (
    <div className={styles.part1Container}>
      <div className={styles.mainArea}>
        {/* Visual area - top left */}
        <div className={styles.visualArea}>
          <div className={styles.visualPlaceholder}>
            {question.type === 'communication' && <div>✈️ Communication Scenario</div>}
            {question.type === 'phraseology' && <div>📡 Phraseology Question</div>}
            {question.type === 'emergency' && <div>🚨 Emergency Scenario</div>}
          </div>
        </div>

        {/* Question area - center/left */}
        <div className={styles.questionArea}>
          <div className={styles.timer}>{question.time}</div>
          <div className={styles.questionMeta}>Question {question.number} of {question.total}</div>
          <div className={styles.progressDots}>{progressDots}</div>
          <div className={styles.questionTitle}>{question.title}</div>
          <div className={styles.questionText}>{question.question}</div>
          <div className={styles.answerArea}>
            <div className={styles.expectedLabel}>Expected Answer:</div>
            <div className={styles.expectedAnswer}>{question.expectedAnswer}</div>
          </div>
          <div className={styles.controlButtons}>
            <button className={styles.btnSkip} onClick={handleSkip}>Skip</button>
            <button className={styles.btnNext} onClick={handleNext}>Next →</button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Info Panels */}
      <aside className={styles.sidebar}>
        {/* Flight Information Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.panelTitle}>Flight Information</div>
          <div className={styles.panelContent}>
            <div className={styles.infoPair}>
              <span className={styles.label}>Reg:</span>
              <span className={styles.value}>{question.flightInfo.reg}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>DEP:</span>
              <span className={styles.value}>{question.flightInfo.dep}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Route:</span>
              <span className={styles.value}>{question.flightInfo.route}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>KANTI</span>
              <span className={styles.value} />
            </div>
          </div>
        </div>

        {/* Aircraft Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.panelTitle}>Aircraft</div>
          <div className={styles.panelContent}>
            <div className={styles.infoPair}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{question.aircraft.type}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>DEST:</span>
              <span className={styles.value}>{question.aircraft.dest}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Stand:</span>
              <span className={styles.value}>{question.aircraft.stand}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Endurance:</span>
              <span className={styles.value}>{question.aircraft.endurance}</span>
            </div>
          </div>
        </div>

        {/* Frequencies Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.panelTitle}>Frequencies</div>
          <div className={styles.panelContent}>
            <div className={styles.infoPair}>
              <span className={styles.label}>Ground:</span>
              <span className={styles.value}>{question.frequencies.ground}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Tower:</span>
              <span className={styles.value}>{question.frequencies.tower}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Approach:</span>
              <span className={styles.value}>{question.frequencies.approach}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Control:</span>
              <span className={styles.value}>{question.frequencies.control}</span>
            </div>
          </div>
        </div>

        {/* Weather Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.panelTitle}>Weather</div>
          <div className={styles.panelContent}>
            <div className={styles.infoPair}>
              <span className={styles.label}>ATIS:</span>
              <span className={styles.value}>{question.weather.atis}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>META:</span>
              <span className={styles.value}>{question.weather.meta}</span>
            </div>
            <div className={styles.infoPair}>
              <span className={styles.label}>Data:</span>
              <span className={styles.value}>{question.weather.data}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
