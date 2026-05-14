import { useState } from 'react'
import { part2Scenarios } from '../data/part2Scenarios'
import styles from './Part2.module.css'
import ScenarioSidebar from './Part2/ScenarioSidebar'
import QuestionPanel from './Part2/QuestionPanel'
import FlightDataCard from './Part2/FlightDataCard'

export default function Part2() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('01')
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [points, setPoints] = useState(0)
  const [attemptedAnswers, setAttemptedAnswers] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false)

  const scenario = part2Scenarios.find(s => s.id === selectedScenarioId)
  const currentQuestion = scenario?.questions[currentQuestionIdx]

  const handleSelectScenario = (scenarioId) => {
    const s = part2Scenarios.find(x => x.id === scenarioId)
    if (!s) return

    setSelectedScenarioId(scenarioId)
    setCurrentQuestionIdx(0)
    setAttemptedAnswers({})
    setSidebarOpenMobile(false)
  }

  const handleNextQuestion = () => {
    if (scenario && currentQuestionIdx < scenario.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1)
    }
  }

  const handleAnswerAttempt = (questionId, payload) => {
    setAttemptedAnswers(prev => ({
      ...prev,
      [questionId]: payload
    }))
    if (payload?.isCorrect && !attemptedAnswers[questionId]?.isCorrect) {
      setPoints(prev => prev + 5)
    }
  }

  if (!scenario) return <div className={styles.loading}>Loading...</div>

  return (
    <div className={styles.part2Container}>
      <div
        className={`${styles.mainLayout} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${
          sidebarOpenMobile ? styles.sidebarOpenMobile : ''
        }`}
      >
        <ScenarioSidebar
          scenarios={part2Scenarios}
          selectedId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          points={points}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
          mobileOpen={sidebarOpenMobile}
          onToggleMobile={() => setSidebarOpenMobile(v => !v)}
        />

        <div className={styles.contentArea}>
          <button
            type="button"
            className={styles.mobileSidebarBtn}
            onClick={() => setSidebarOpenMobile(true)}
          >
            Scenarios
          </button>
          <div className={styles.playArea}>
            <div className={styles.leftStack}>
              <div className={styles.topPane} />

              <QuestionPanel
                scenario={scenario}
                currentQuestion={currentQuestion}
                currentIdx={currentQuestionIdx}
                totalQuestions={scenario.questions.length}
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                onAnswerAttempt={handleAnswerAttempt}
                attemptedAnswers={attemptedAnswers}
              />
            </div>

            <FlightDataCard flightData={scenario.flightData} />
          </div>
        </div>
      </div>
    </div>
  )
}
