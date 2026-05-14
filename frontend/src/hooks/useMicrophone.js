import { useRef, useState, useCallback } from 'react'

export function useMicrophone() {
  const [micStatus, setMicStatus]   = useState('idle')   // idle | requesting | ready | listening | error
  const [transcript, setTranscript] = useState('')
  const [error, setError]           = useState(null)

  const streamRef    = useRef(null)   // MediaStream — kept alive after first grant
  const recognRef    = useRef(null)
  const finalBufRef  = useRef('')
  const listeningRef = useRef(false)
  const onStopCbRef  = useRef(null)

  // ── Request permission ONCE and keep stream alive ───────────
  const requestPermission = useCallback(async () => {
    if (streamRef.current) return true           // already have permission
    setMicStatus('requesting')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation:   true,
          noiseSuppression:   true,
          autoGainControl:    true,
          sampleRate:         16000,
        },
        video: false,
      })
      streamRef.current = stream
      setMicStatus('ready')
      return true
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Allow mic in browser settings and refresh.'
          : err.name === 'NotFoundError'
          ? 'No microphone found. Plug in a mic and refresh.'
          : `Microphone error: ${err.message}`
      setError(msg)
      setMicStatus('error')
      return false
    }
  }, [])

  // ── Build SpeechRecognition instance ────────────────────────
  const buildRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null

    const r = new SR()
    r.continuous      = true
    r.interimResults  = true
    r.maxAlternatives = 1
    r.lang            = 'en-US'
    return r
  }, [])

  // ── Start listening ─────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (listeningRef.current) return

    const granted = await requestPermission()
    if (!granted) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Speech recognition not supported. Use Chrome or Edge.')
      setMicStatus('error')
      return
    }

    finalBufRef.current = ''
    setTranscript('')
    listeningRef.current = true
    setMicStatus('listening')

    const recog = buildRecognition()
    recognRef.current = recog

    recog.onresult = (event) => {
      let final = '', interim = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final   += event.results[i][0].transcript + ' '
        else                          interim += event.results[i][0].transcript
      }
      finalBufRef.current = final.trim()
      setTranscript((final + interim).trim())
    }

    recog.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setError('Microphone blocked. Allow access in browser settings.')
        setMicStatus('error')
        listeningRef.current = false
      } else if (ev.error === 'no-speech') {
        // Not a real error — user just hasn't spoken yet
      } else if (ev.error !== 'aborted') {
        console.warn('SR error:', ev.error)
      }
    }

    // Auto-restart if Chrome times out (60s limit)
    recog.onend = () => {
      if (listeningRef.current) {
        try { recog.start() } catch {}
      }
    }

    try {
      recog.start()
    } catch (e) {
      setError('Could not start speech recognition. Try TEXT mode.')
      setMicStatus('error')
      listeningRef.current = false
    }
  }, [requestPermission, buildRecognition])

  // ── Stop listening — returns final transcript ───────────────
  const stopListening = useCallback(() => {
    listeningRef.current = false
    if (recognRef.current) {
      try { recognRef.current.abort() } catch {}
      recognRef.current = null
    }
    setMicStatus(streamRef.current ? 'ready' : 'idle')
    const result = finalBufRef.current.trim()
    finalBufRef.current = ''
    return result
  }, [])

  // ── Release mic entirely (optional cleanup) ─────────────────
  const releaseMic = useCallback(() => {
    stopListening()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setMicStatus('idle')
  }, [stopListening])

  return {
    micStatus,         // 'idle' | 'requesting' | 'ready' | 'listening' | 'error'
    transcript,        // live transcript while listening
    error,
    requestPermission,
    startListening,
    stopListening,
    releaseMic,
    hasPermission: () => !!streamRef.current,
  }
}
