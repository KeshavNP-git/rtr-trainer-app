import { useState } from 'react'
import styles from './LearnTransmissions.module.css'
import { TRANSMISSIONS_FULL } from '../data/transmissionsFullData'

const CATEGORIES = Object.keys(TRANSMISSIONS_FULL)

export default function LearnTransmissions(){
  const [cat, setCat] = useState(CATEGORIES[0])
  const items = TRANSMISSIONS_FULL[cat] || []
  const [selectedId, setSelectedId] = useState(items[0]?.id)
  const selected = items.find(i=>i.id===selectedId) || items[0]

  return (
    <div className={styles.shell}>
      {/* Top category buttons */}
      <div className={styles.topCategories}>
        {CATEGORIES.map(c=> (
          <button key={c} className={`${styles.catBtn} ${c===cat?styles.catBtnActive:''}`} onClick={()=>{setCat(c); setSelectedId(TRANSMISSIONS_FULL[c][0]?.id)}}>
            {c}
          </button>
        ))}
      </div>

      {/* Main content: left list + right detail */}
      <div className={styles.container}>
        <aside className={styles.leftList}>
          <div className={styles.listHeader}>{cat.toUpperCase()} {items.length}</div>
          <div className={styles.itemsList}>
            {items.map((it, idx)=> (
              <div key={it.id} className={`${styles.listItem} ${it.id===selectedId?styles.listItemActive:''}`} onClick={()=>setSelectedId(it.id)}>
                <div className={styles.itemNum}>{it.num}</div>
                <div className={styles.itemName}>{it.title}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.rightDetail}>
          {selected && (
            <>
              <div className={styles.detailHeader}>
                <span className={styles.badge}>{selected.num}</span>
                <h2>{selected.title}</h2>
              </div>

              <div className={styles.whenToUse}>
                <div className={styles.whenLabel}>⏱ WHEN TO USE</div>
                <div className={styles.whenText}>{selected.whenToUse}</div>
              </div>

              <div className={styles.transmissionBoxes}>
                <div className={styles.boxPilot}>
                  <div className={styles.boxLabel}>⬇ PILOT TRANSMISSION</div>
                  <div className={styles.boxContent}>{selected.pilot}</div>
                </div>
                <div className={styles.boxATC}>
                  <div className={styles.boxLabel}>⬆ ATC RESPONSE</div>
                  <div className={styles.boxContent}>{selected.atc}</div>
                </div>
              </div>

              {selected.examples && selected.examples.length > 0 && (
                <div className={styles.exampleConv}>
                  <div className={styles.exampleLabel}>💬 EXAMPLE CONVERSATION <span className={styles.exampleRef}>ICAO DOC 9432</span></div>
                  <div className={styles.convBubbles}>
                    {selected.examples.map((ex, i)=> (
                      <div key={i} className={`${styles.bubble} ${styles[`bubble${ex.speaker}`.toUpperCase()]}`}>
                        <div className={styles.bubbleLabel}>{ex.speaker === 'pilot' ? '⬇ PILOT' : '⬆ ATC'}</div>
                        <div className={styles.bubbleText}>{ex.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
