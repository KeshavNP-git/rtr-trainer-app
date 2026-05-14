import { useState, useRef, useCallback, useEffect } from 'react'
import { SCENARIOS } from '../data/scenarios'
import { useMicrophone } from '../hooks/useMicrophone'
import { useAudio } from '../hooks/useAudio'
import { sendToATC } from '../services/api'
import PhaseTracker from './PhaseTracker'
import Waveform from './Waveform'
import styles from './Simulator.module.css'

export default function Simulator() {
  const [selectedId,    setSelectedId]    = useState(null)
  const [messages,      setMessages]      = useState([])
  const [history,       setHistory]       = useState([])
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [isPlaying,     setIsPlaying]     = useState(false)
  const [inputMode,     setInputMode]     = useState('mic')  // 'mic' | 'text'
  const [textInput,     setTextInput]     = useState('')
  const [error,         setError]         = useState(null)
  const [currentPhase,  setCurrentPhase]  = useState(0)
  const [score,         setScore]         = useState(null)
  const [scores,        setScores]        = useState([])
  const [answerShown,   setAnswerShown]   = useState(false)
  const [filter,        setFilter]        = useState('')

  const logRef = useRef(null)
  const mic    = useMicrophone()
  const audio  = useAudio()

  const scenario = SCENARIOS.find(s => s.id === selectedId)

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  // Clear error after 8s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 8000)
    return () => clearTimeout(t)
  }, [error])

  // ── Select scenario ─────────────────────────────────────────
  const selectScenario = useCallback(async (id) => {
    audio.stopAudio()
    setSelectedId(id)
    setMessages([])
    setHistory([])
    setCurrentPhase(0)
    setScore(null)
    setScores([])
    setAnswerShown(false)
    setError(null)

    const s = SCENARIOS.find(x => x.id === id)
    if (!s) return

    // Opening system message
    addMessage('system', 'SYS', `▶ ${s.task}: ${s.title} | ${s.freq} MHz | ${s.station}`)
    addMessage('system', 'SYS', `Aircraft: ${s.aircraft} (${s.type}) | ${s.dep} → ${s.arr}`)

    // ATC opening line
    const opening = getOpeningLine(s)
    addMessage('atc', s.station, opening)
    setHistory([{ role: 'assistant', content: opening }])

    // Speak opening
    setIsPlaying(true)
    audio.playATCVoice(opening, null, null, () => setIsPlaying(false))
    audio.playClick()
    audio.playStatic(0.12)
  }, [audio])

  // ── Add message helper ──────────────────────────────────────
  const addMessage = useCallback((type, sender, text, feedback = null, sc = null) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type, sender, text, feedback, score: sc,
      time: new Date().toUTCString().slice(17, 22) + 'Z',
    }])
  }, [])

  // ── Transmit (send to backend) ──────────────────────────────
  const transmit = useCallback(async (text) => {
    if (!text?.trim() || !scenario || isProcessing || isPlaying) return
    setIsProcessing(true)
    setError(null)
    audio.playClick()
    audio.playStatic(0.1)

    addMessage('pilot', scenario.aircraft, text.trim())

    try {
      const res = await sendToATC({
        pilotText:  text.trim(),
        scenarioId: scenario.id,
        history,
      })

      const { atcText, feedback, audioBase64, audioMime, updatedHistory } = res
      setHistory(updatedHistory || [...history, { role: 'user', content: text }, { role: 'assistant', content: atcText }])

      // Parse score
      let sc = null
      if (feedback) {
        const m = feedback.match(/(\d+)\s*\/\s*10/i) || feedback.match(/Score\s*[:\s]*(\d+)/i)
        if (m) {
          sc = parseInt(m[1])
          setScores(prev => {
            const next = [...prev, sc]
            setScore(Math.round(next.reduce((a, b) => a + b, 0) / next.length))
            return next
          })
          // Advance phase on good score
          if (sc >= 6 && currentPhase < (scenario.phases?.length ?? 0) - 1) {
            setCurrentPhase(p => p + 1)
          }
        }
      }

      addMessage('atc', scenario.station, atcText, feedback, sc)

      // Play audio
      setIsPlaying(true)
      await audio.playATCVoice(atcText, audioBase64, audioMime, () => setIsPlaying(false))

    } catch (err) {
      setError('Connection error: ' + err.message)
      addMessage('system', 'SYS', '⚠ Could not reach server. Check connection.')
    } finally {
      setIsProcessing(false)
    }
  }, [scenario, isProcessing, isPlaying, history, currentPhase, addMessage, audio])

  // ── PTT handlers ────────────────────────────────────────────
  const handlePTTDown = useCallback(async (e) => {
    e?.preventDefault()
    if (!scenario) { setError('Select a scenario first.'); return }
    if (isProcessing || isPlaying) return
    audio.playClick()
    await mic.startListening()
  }, [scenario, isProcessing, isPlaying, audio, mic])

  const handlePTTUp = useCallback(async (e) => {
    e?.preventDefault()
    const text = mic.stopListening()
    if (!text) {
      setError('No speech detected. Speak clearly after pressing PTT, or switch to TEXT mode.')
      return
    }
    await transmit(text)
  }, [mic, transmit])

  // ── Keyboard PTT (SPACE) ─────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea') && inputMode === 'mic') {
        e.preventDefault()
        if (!mic.micStatus.includes('listen')) handlePTTDown()
      }
    }
    const up = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea') && inputMode === 'mic') {
        e.preventDefault()
        if (mic.micStatus === 'listening') handlePTTUp()
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [inputMode, mic.micStatus, handlePTTDown, handlePTTUp])

  // ── Text send ────────────────────────────────────────────────
  const handleTextSend = useCallback(() => {
    const t = textInput.trim()
    if (!t) return
    setTextInput('')
    transmit(t)
  }, [textInput, transmit])

  // ── Filter scenarios ─────────────────────────────────────────
  const filtered = SCENARIOS.filter(s =>
    !filter ||
    s.title.toLowerCase().includes(filter.toLowerCase()) ||
    s.phase.toLowerCase().includes(filter.toLowerCase()) ||
    s.task.toLowerCase().includes(filter.toLowerCase())
  )

  const phaseBadgeColors = {
    'PRE-DEPARTURE': '#1a3a2a',
    'DEPARTURE': '#1a2a3a',
    'CRUISE': '#1a1a3a',
    'DESCENT': '#2a1a3a',
    'APPROACH': '#3a1a2a',
    'LANDING': '#3a2a1a',
    'ARRIVAL': '#1a3a1a',
    'EMERGENCY': '#3a1a1a',
  }

  return (
    <div className={styles.layout}>

      {/* ── LEFT: scenario list ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHdr}>◈ FLIGHT SCENARIOS — IndiGo 6E-101</div>
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search scenarios..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className={styles.scenList}>
          {filtered.map(s => (
            <div
              key={s.id}
              className={`${styles.scenItem} ${selectedId === s.id ? styles.scenActive : ''}`}
              onClick={() => selectScenario(s.id)}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div className={styles.scenTask}>{s.task}</div>
                <div
                  className={styles.phaseBadge}
                  style={{ background: phaseBadgeColors[s.phase] || '#1a2030' }}
                >
                  {s.phase}
                </div>
              </div>
              <div className={styles.scenTitle}>{s.title}</div>
              <div className={styles.scenMeta}>
                {s.freq} MHz · {s.dep}→{s.arr}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── CENTER: radio ── */}
      <section className={styles.center}>

        {/* Scenario brief */}
        {scenario ? (
          <div className={styles.brief}>
            <div className={styles.briefLeft}>
              <div className={styles.briefTitle}>{scenario.task}: {scenario.title}</div>
              <div className={styles.briefDesc}>{scenario.description}</div>
            </div>
            <div className={styles.briefRight}>
              <div className={styles.freqDisplay}>{scenario.freq}</div>
              <div className={styles.freqLabel}>MHz</div>
            </div>
          </div>
        ) : (
          <div className={styles.brief}>
            <div className={styles.briefLeft}>
              <div className={styles.briefTitle}>SELECT A SCENARIO</div>
              <div className={styles.briefDesc}>
                Choose any of the 14 tasks from the left panel. All scenarios use IndiGo 6E-101 (A320) — 
                one aircraft, one callsign, from startup to shutdown.
              </div>
            </div>
          </div>
        )}

        {/* Radio header bar */}
        <div className={styles.radioBar}>
          {[
            ['STATION', scenario?.station ?? '—'],
            ['AIRCRAFT', scenario?.aircraft ?? '—'],
            ['RUNWAY', scenario?.runway ?? '—'],
            ['SQUAWK', scenario?.squawk ?? '—'],
          ].map(([lbl, val]) => (
            <div key={lbl} className={styles.infoPill}>
              <span className={styles.pillLabel}>{lbl}:</span>
              <span className={styles.pillValue}>{val}</span>
            </div>
          ))}
          {isPlaying && (
            <div className={styles.playingBadge}>
              <span className={styles.playDot} /> ATC TRANSMITTING
            </div>
          )}
        </div>

        {/* Error banner */}
        {(error || mic.error) && (
          <div className={styles.errBanner}>⚠ {error || mic.error}</div>
        )}

        {/* Comm log */}
        <div className={styles.commLog} ref={logRef}>
          {messages.length === 0 && (
            <div className={styles.emptyLog}>
              Select a scenario and press PTT to begin your radio communication
            </div>
          )}
          {messages.map(msg => (
            <Message key={msg.id} msg={msg} />
          ))}
          {isProcessing && <TypingIndicator label={scenario?.station ?? 'ATC'} />}
        </div>

        {/* Waveform */}
        <Waveform active={mic.micStatus === 'listening' || isPlaying} />

        {/* Input area */}
        <div className={styles.inputArea}>

          {/* Mode toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${inputMode === 'mic' ? styles.modeBtnOn : ''}`}
              onClick={() => setInputMode('mic')}
            >
              🎙 MICROPHONE
            </button>
            <button
              className={`${styles.modeBtn} ${inputMode === 'text' ? styles.modeBtnOn : ''}`}
              onClick={() => setInputMode('text')}
            >
              ⌨ TYPE
            </button>
            <span className={styles.modeHint}>
              {inputMode === 'mic' ? 'Hold PTT button or SPACE key' : 'CTRL+ENTER to transmit'}
            </span>
          </div>

          <div className={styles.inputRow}>
            {/* Transcript / text input */}
            <div className={styles.inputMain}>
              {inputMode === 'mic' ? (
                <div className={`${styles.micDisplay} ${mic.micStatus === 'listening' ? styles.micLive : ''}`}>
                  {mic.micStatus === 'requesting' && '🔐 Requesting microphone permission...'}
                  {mic.micStatus === 'listening' && (
                    <span>
                      🔴 TRANSMITTING — {mic.transcript || 'Speak now...'}
                    </span>
                  )}
                  {(mic.micStatus === 'idle' || mic.micStatus === 'ready') &&
                    (mic.transcript || 'Awaiting transmission...')}
                  {mic.micStatus === 'error' && `❌ ${mic.error}`}
                </div>
              ) : (
                <textarea
                  className={styles.textInput}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleTextSend() } }}
                  placeholder={
                    scenario
                      ? `Type your radio call... e.g: "${scenario.expectedCalls?.[0] ?? ''}"`
                      : 'Select a scenario first...'
                  }
                />
              )}

              {/* Mic status line */}
              {inputMode === 'mic' && (
                <div className={styles.statusLine}>
                  <MicStatusDot status={mic.micStatus} />
                  <span className={styles.statusText}>
                    {mic.micStatus === 'idle'       && 'MIC IDLE — press PTT to transmit'}
                    {mic.micStatus === 'requesting' && 'REQUESTING PERMISSION...'}
                    {mic.micStatus === 'ready'      && 'MIC READY — hold PTT to transmit'}
                    {mic.micStatus === 'listening'  && 'TRANSMITTING — release PTT when done'}
                    {mic.micStatus === 'error'      && 'MIC ERROR — switch to TEXT mode'}
                  </span>
                </div>
              )}
            </div>

            {/* PTT / SEND button */}
            <div className={styles.pttWrap}>
              {inputMode === 'mic' ? (
                <>
                  <div
                    className={`${styles.ptt} ${mic.micStatus === 'listening' ? styles.pttLive : ''} ${(isProcessing || isPlaying) ? styles.pttDisabled : ''}`}
                    onMouseDown={handlePTTDown}
                    onMouseUp={handlePTTUp}
                    onTouchStart={handlePTTDown}
                    onTouchEnd={handlePTTUp}
                  >
                    <div className={styles.pttRing} />
                    <div className={styles.pttIcon}>🎙</div>
                    <div className={styles.pttLabel}>PTT</div>
                  </div>
                  <div className={styles.pttHint}>HOLD TO<br />TRANSMIT</div>
                </>
              ) : (
                <>
                  <button
                    className={`${styles.sendBtn} ${(isProcessing || isPlaying || !textInput.trim()) ? styles.sendDisabled : ''}`}
                    onClick={handleTextSend}
                    disabled={isProcessing || isPlaying || !textInput.trim()}
                  >
                    <span>▶</span>
                    <span>SEND</span>
                  </button>
                  <div className={styles.pttHint}>CTRL+<br />ENTER</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT: info panel ── */}
      <aside className={styles.rightPanel}>

        {/* ATIS */}
        <div className={styles.rpSection}>
          <div className={styles.rpTitle}>◈ ATIS / WEATHER</div>
          {scenario ? (
            <div className={styles.atisGrid}>
              {[
                ['WIND',  scenario.atis.wind],
                ['VIS',   scenario.atis.vis],
                ['TEMP',  scenario.atis.temp],
                ['QNH',   scenario.atis.qnh],
                ['INFO',  scenario.atis.info],
                ['CLOUD', scenario.atis.cloud],
              ].map(([lbl, val]) => (
                <div key={lbl} className={styles.atisItem}>
                  <div className={styles.atisLabel}>{lbl}</div>
                  <div className={styles.atisValue}
                    style={lbl === 'INFO' ? { fontSize: '20px' } : lbl === 'CLOUD' ? { fontSize: '10px' } : {}}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>Select a scenario</div>
          )}
        </div>

        {/* Phase tracker */}
        {scenario && (
          <div className={styles.rpSection}>
            <div className={styles.rpTitle}>◈ FLIGHT PHASE</div>
            <PhaseTracker phases={scenario.phases ?? []} currentPhase={currentPhase} />
          </div>
        )}

        {/* Expected call reveal */}
        {scenario && (
          <div className={styles.rpSection}>
            <div className={styles.rpTitle}>◈ EXPECTED CALL</div>
            <button className={styles.revealBtn} onClick={() => setAnswerShown(a => !a)}>
              {answerShown ? '🙈 HIDE ANSWER' : '👁 REVEAL ANSWER'}
            </button>
            <div
              className={`${styles.answerBox} ${answerShown ? styles.answerShown : ''}`}
              onClick={() => setAnswerShown(a => !a)}
            >
              {scenario.expectedCalls?.[currentPhase] ?? 'No expected call for this phase.'}
            </div>
            <div className={styles.answerHint}>
              Phase {currentPhase + 1}/{scenario.phases?.length ?? 1}: {scenario.phases?.[currentPhase] ?? ''}
            </div>
          </div>
        )}

        {/* Score */}
        <div className={styles.rpSection}>
          <div className={styles.rpTitle}>◈ SESSION SCORE</div>
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreBig}
              style={{ color: score == null ? 'var(--text-dim)' : score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)' }}>
              {score ?? '—'}
            </div>
            <div className={styles.scoreLabel}>AVG / 10</div>
          </div>
          <div className={styles.statRow}><span>Transmissions</span><span>{messages.filter(m => m.type === 'pilot').length}</span></div>
          <div className={styles.statRow}><span>High scores (8+)</span><span className={styles.green}>{scores.filter(s => s >= 8).length}</span></div>
          <div className={styles.statRow}><span>Needs review</span><span className={scores.filter(s => s < 6).length > 0 ? styles.red : ''}>{scores.filter(s => s < 6).length}</span></div>
        </div>

        {/* Quick ref */}
        <div className={styles.rpSection}>
          <div className={styles.rpTitle}>◈ QUICK REFERENCE</div>
          <div className={styles.quickRef}>
            {[
              ['AFFIRM', 'Yes'],
              ['NEGATIVE', 'No'],
              ['WILCO', 'Will comply'],
              ['ROGER', 'Received'],
              ['SAY AGAIN', 'Repeat please'],
              ['STANDBY', 'Wait'],
              ['MAYDAY×3', 'Emergency'],
              ['PAN PAN×3', 'Urgency'],
              ['7700', 'Emergency squawk'],
              ['7600', 'Radio failure'],
            ].map(([w, m]) => (
              <div key={w} className={styles.refRow}>
                <span className={styles.refWord}>{w}</span>
                <span className={styles.refMean}>{m}</span>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function Message({ msg }) {
  const scoreLabel = msg.score == null ? null :
    msg.score >= 8 ? '✓ CORRECT'     :
    msg.score >= 6 ? '△ ACCEPTABLE'  : '✗ REVIEW NEEDED'
  const scoreCls   = msg.score == null ? '' :
    msg.score >= 8 ? styles.scoreGood : msg.score >= 6 ? styles.scoreOk : styles.scoreBad

  return (
    <div className={`${styles.msg} ${styles['msg_' + msg.type]} fade-up`}>
      <div className={styles.msgAvatar}>{msg.sender.slice(0, 3).toUpperCase()}</div>
      <div className={styles.msgBody}>
        <div className={styles.msgWho}>{msg.sender}</div>
        <div className={styles.msgText}>{msg.text}</div>
        {msg.feedback && (
          <div className={styles.feedback}>
            <span className={styles.feedbackLabel}>📊 ANALYSIS: </span>
            {msg.feedback.replace(/\[SCORE\]/, '').trim()}
            {scoreLabel && (
              <span className={`${styles.scoreBadge} ${scoreCls}`}>
                {scoreLabel} {msg.score}/10
              </span>
            )}
          </div>
        )}
        <div className={styles.msgTime}>{msg.time}</div>
      </div>
    </div>
  )
}

function TypingIndicator({ label }) {
  return (
    <div className={`${styles.msg} ${styles.msg_atc} fade-up`}>
      <div className={styles.msgAvatar}>{label.slice(0, 3).toUpperCase()}</div>
      <div className={styles.msgBody}>
        <div className={styles.msgWho}>{label}</div>
        <div className={styles.msgText}>
          <div className={styles.typing}>
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MicStatusDot({ status }) {
  const color = {
    idle:       'var(--text-dim)',
    requesting: 'var(--amber)',
    ready:      'var(--green)',
    listening:  'var(--red)',
    error:      'var(--red)',
  }[status] || 'var(--text-dim)'
  return (
    <span style={{
      display: 'inline-block',
      width: 7, height: 7,
      borderRadius: '50%',
      background: color,
      boxShadow: status === 'listening' ? `0 0 6px ${color}` : 'none',
      animation: status === 'listening' ? 'pulse-glow 1s infinite' : 'none',
      flexShrink: 0,
      marginRight: 5,
    }} />
  )
}

function getOpeningLine(s) {
  const lines = {
    clearance_delivery:   `IndiGo 101, Delhi Delivery, pass your message.`,
    pushback_startup:     `IndiGo 101, Delhi Ground, go ahead.`,
    taxi:                 `IndiGo 101, Delhi Ground, report when ready to taxi.`,
    takeoff:              `IndiGo 101, Delhi Tower, hold position, traffic on final.`,
    climb_departure:      `IndiGo 101, Delhi Departure, radar contact, climb flight level 100.`,
    cruise:               `IndiGo 101, Mumbai Control, identified, report your level.`,
    descent:              `IndiGo 101, Mumbai Approach, radar contact, information Bravo correct?`,
    approach:             `IndiGo 101, turn left heading 240, descend 2500 feet, ILS runway 27.`,
    landing:              `IndiGo 101, wind 270 degrees 10 knots, report final runway 27.`,
    after_landing:        `IndiGo 101, Mumbai Ground, welcome to Mumbai, taxi instructions to follow.`,
    emergency_engine:     `IndiGo 101, Delhi Departure, radar contact, climb flight level 100, turn right heading 090. [ENGINE WARNING WILL TRIGGER AFTER YOUR FIRST READBACK]`,
    emergency_goaround:   `IndiGo 101, you are on ILS final runway 27, 4 miles. STANDBY — runway not clear. GO AROUND, GO AROUND, runway not clear, climb 3000 feet, left turn heading 240.`,
    emergency_diversion:  `IndiGo 101, Mumbai Control, identified flight level 350. Report your intentions.`,
    holding:              `IndiGo 101, Mumbai Approach, expect delay due runway inspection. Stand by for holding clearance.`,
  }
  return lines[s.id] || `${s.aircraft}, ${s.station}, go ahead.`
}
