import { useState } from 'react'
import styles from './SidePanel.module.css'

export default function SidePanel({ scenario, transmission }) {
  const [showPilot, setShowPilot] = useState(false)
  // prefer transmission if provided (from Part2), otherwise fall back to scenario
  const pilot = (transmission && transmission.pilot) || scenario?.expectedCalls?.[0] || (scenario? `[Station] [Callsign] REQUEST ${scenario.title.toUpperCase()}` : '')
  const atc = (transmission && transmission.atc) || scenario?.expectedCalls?.[1] || ''

  return (
    <div className={styles.panel}>
      {scenario && (
        <>
          <div className={styles.row} aria-hidden>
            <div className={styles.box}>
              <div className={styles.boxTitle}>Flight Information</div>
              <div className={styles.boxBody}>
                <div>Reg: VT-IND</div>
                <div>DEP: {scenario.dep}</div>
                <div>Route: {scenario.dep} → {scenario.arr}</div>
              </div>
            </div>
            <div className={styles.box}>
              <div className={styles.boxTitle}>Aircraft</div>
              <div className={styles.boxBody}>
                <div>Type: {scenario.type}</div>
                <div>DEST: {scenario.arr} RWY {scenario.runway || '—'}</div>
                <div>Stand: Stand 3</div>
                <div>Endurance: 05:30</div>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.boxTall}>
              <div className={styles.boxTitle}>Frequencies</div>
              <div className={styles.boxBody}>
                <div>Ground: 121.9</div>
                <div>Tower: 118.1</div>
                <div>Approach: 119.7</div>
                <div>Control: 125.3</div>
              </div>
            </div>
            <div className={styles.boxTall}>
              <div className={styles.boxTitle}>Weather</div>
              <div className={styles.boxBody}>
                <div>ATIS: INFORMATION {scenario.atis?.info || 'N/A'}</div>
                <div>METAR: {scenario.atis?.wind || ''} {scenario.atis?.vis || ''}</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.transmissions}>
        <div className={styles.transHeader}>PILOT TRANSMISSION</div>
        <div className={`${styles.chatBubblePilot} ${showPilot?styles.visible:styles.blurred}`} onClick={()=>setShowPilot(s=>!s)}>
          {showPilot ? (<div className={styles.pilotText}>{pilot}</div>) : (<div className={styles.atcReveal}>Click to reveal pilot phrase</div>)}
        </div>

        <div className={styles.transHeader}>ATC RESPONSE</div>
        <div className={styles.chatBubbleATC}>
          {/* intentionally blank or show minimal ATC in examples — content shown in example conversation below */}
        </div>

        <div className={styles.notes}>
          <div className={styles.notesTitle}>EXAMPLE CONVERSATION</div>
          <div className={styles.notesBody}>
            {scenario?.expectedCalls?.map((c,i)=> <div key={i} className={styles.conv}>{c}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
