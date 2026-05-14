import { useState } from 'react'
import { LEARN_MODULES, PHONETIC_TABLE } from '../data/scenarios'
import styles from './LearnModule.module.css'

export default function LearnModule() {
  const [activeId, setActiveId] = useState(LEARN_MODULES[0].id)
  const active = LEARN_MODULES.find(m => m.id === activeId)

  return (
    <div className={styles.layout}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHdr}>◈ STUDY MODULES</div>
        {LEARN_MODULES.map(m => (
          <div
            key={m.id}
            className={`${styles.navItem} ${activeId === m.id ? styles.navActive : ''}`}
            onClick={() => setActiveId(m.id)}
          >
            <div className={styles.navIcon}>{m.icon}</div>
            <div>
              <div className={styles.navTitle}>{m.title}</div>
              <div className={styles.navSub}>{m.subtitle}</div>
            </div>
          </div>
        ))}
      </aside>

      {/* ── Content ── */}
      <div className={styles.content}>
        {active && (
          <>
            <div className={styles.pageHeader}>
              <div className={styles.pageTitle}>{active.icon} {active.title.toUpperCase()}</div>
            </div>

            {active.sections.map((sec, i) => (
              <Section key={i} sec={sec} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function Section({ sec }) {
  if (sec.phonetic) return <PhoneticTable />
  if (sec.phrases)  return <PhrasesTable heading={sec.heading} phrases={sec.phrases} />

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>{sec.heading}</div>
      <div className={styles.cardBody}>
        <pre className={styles.bodyText}>{sec.body}</pre>
      </div>
    </div>
  )
}

function PhoneticTable() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>ICAO PHONETIC ALPHABET</div>
      <div className={styles.cardBody}>
        <div className={styles.phoneticGrid}>
          {PHONETIC_TABLE.map(({ letter, word, pronounce }) => (
            <div key={letter} className={styles.phoneticItem}>
              <div className={styles.phonLetter}>{letter}</div>
              <div>
                <div className={styles.phonWord}>{word}</div>
                <div className={styles.phonPron}>{pronounce}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.numTable}>
          <div className={styles.numTitle}>NUMBER PRONUNCIATION</div>
          <div className={styles.numGrid}>
            {[['0','ZERO'],['1','WUN'],['2','TOO'],['3','TREE'],['4','FOW-er'],
              ['5','FIFE'],['6','SIX'],['7','SEV-en'],['8','AIT'],['9','NIN-er']].map(([n,p])=>(
              <div key={n} className={styles.numItem}>
                <span className={styles.numDigit}>{n}</span>
                <span className={styles.numPron}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhrasesTable({ heading, phrases }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>{heading}</div>
      <div className={styles.cardBody}>
        <div className={styles.phraseList}>
          {phrases.map(({ word, meaning }) => (
            <div key={word} className={styles.phraseRow}>
              <span className={styles.phraseWord}>{word}</span>
              <span className={styles.phraseMean}>{meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
