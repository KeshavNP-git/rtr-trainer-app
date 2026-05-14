import { useState } from 'react'
import Simulator from './components/Simulator'
import LearnModule from './components/LearnModule'
import Part1 from './components/Part1'
import Part2 from './components/Part2'
import LearnTransmissions from './components/LearnTransmissions'
import RadioComm from './components/RadioComm'
import styles from './App.module.css'
import { useEffect } from 'react'
import { startKeepAlive } from './services/api'

export default function App() {
  const [tab, setTab] = useState('radiocomm')

  // Keep Render backend alive (free tier spins down after 15min idle)
  useEffect(() => {
    const id = startKeepAlive()
    return () => { if (id) clearInterval(id) }
  }, [])

  return (
    <div className={styles.app}>
      {/* ── Top Nav ── */}
      <header className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✈</span>
          <div>
            <div className={styles.brandTitle}>RTR TRAINER</div>
            <div className={styles.brandSub}>A320 · ICAO Radio Communication Simulator</div>
          </div>
        </div>

        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'part1' ? styles.tabActive : ''}`}
            onClick={() => setTab('part1')}
          >
            <span className={styles.tabNum}>1</span>
            PART 1
          </button>
          <button
            className={`${styles.tab} ${tab === 'part2' ? styles.tabActive : ''}`}
            onClick={() => setTab('part2')}
          >
            <span className={styles.tabNum}>2</span>
            PART 2
          </button>
          <button
            className={`${styles.tab} ${tab === 'learntx' ? styles.tabActive : ''}`}
            onClick={() => setTab('learntx')}
          >
            <span className={styles.tabNum}>☰</span>
            LEARN TRANSMISSIONS
          </button>
          <button
            className={`${styles.tab} ${tab === 'radiocomm' ? styles.tabActive : ''}`}
            onClick={() => setTab('radiocomm')}
          >
            <span className={styles.tabNum}>🎙️</span>
            RADIO COMM
          </button>
        </nav>

        <div className={styles.navRight}>
          <div className={styles.led}>
            <span className={`${styles.ledDot} ${styles.ledGreen}`} />
            AI LIVE
          </div>
          <div className={styles.led}>
            <span className={`${styles.ledDot} ${styles.ledAmber}`} />
            IndiGo 6E-101
          </div>
          <Clock />
        </div>
      </header>

      {/* ── Panels ── */}
      <main className={styles.main}>
        {tab === 'sim'   && <Simulator />}
        {tab === 'learn' && <LearnModule />}
        {tab === 'part1' && <Part1 />}
        {tab === 'part2' && <Part2 />}
        {tab === 'learntx' && <LearnTransmissions />}
        {tab === 'radiocomm' && <RadioComm />}
      </main>
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState(getUTC())
  setTimeout(() => setTime(getUTC()), 15000)
  function getUTC() {
    const n = new Date()
    return String(n.getUTCHours()).padStart(2,'0') + ':' + String(n.getUTCMinutes()).padStart(2,'0') + 'Z'
  }
  return <div className={styles.clock}>{time}</div>
}
