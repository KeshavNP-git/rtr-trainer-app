import styles from './ScenarioSidebar.module.css'

export default function ScenarioSidebar({
  scenarios,
  selectedId,
  onSelectScenario,
  points,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onToggleMobile,
}) {
  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.title}>{collapsed ? 'Scn' : 'Select a Scenario'}</div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.iconBtn} onClick={onToggleCollapsed} title="Collapse/Expand">
              {collapsed ? '»' : '«'}
            </button>
            <button type="button" className={styles.iconBtnMobile} onClick={onToggleMobile} title="Close sidebar">
              ✕
            </button>
          </div>
        </div>
        {!collapsed && (
          <div className={styles.subtitle}>
            Each scenario contains 6 questions with sub-questions based on predefined flight data.
          </div>
        )}
      </div>

      <div className={styles.pointsDisplay}>
        <span className={styles.star}>⭐</span>
        {!collapsed && <span className={styles.pointsText}>{points} RTR NP Points</span>}
      </div>

      <div className={styles.scenarioList}>
        {scenarios.map((scenario) => {
          const isSelected = selectedId === scenario.id
          return (
            <div
              key={scenario.id}
              className={[
                styles.scenarioCard,
                isSelected ? styles.active : '',
              ].join(' ')}
              onClick={() => onSelectScenario(scenario.id)}
              role="button"
              tabIndex={0}
            >
            <div className={styles.cardHeader}>
                <span className={styles.scenarioNumber}>{scenario.id}</span>
                {!collapsed && <span className={styles.scenarioTitle}>— {scenario.title}</span>}
            </div>

              {!collapsed && (
                <div className={styles.cardMeta}>
                  <span>{scenario.totalQuestions} questions</span>
                  <span>·</span>
                  <span>{scenario.totalSubQuestions} sub-questions</span>
                  <span>·</span>
                  <span className={styles.route}>{scenario.route}</span>
                </div>
              )}

            <div className={styles.statusBadge}>
                {!collapsed && <span className={styles.freeBadge}>Free</span>}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
