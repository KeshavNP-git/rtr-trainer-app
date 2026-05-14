import { useRef, useCallback } from 'react'

export function useAudio() {
  const audioCtxRef  = useRef(null)
  const currentAudio = useRef(null)

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // ── Radio click sound ───────────────────────────────────────
  const playClick = useCallback(() => {
    try {
      const ctx = ensureCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 900
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.065)
    } catch {}
  }, [ensureCtx])

  // ── Radio static burst ──────────────────────────────────────
  const playStatic = useCallback((duration = 0.2) => {
    try {
      const ctx   = ensureCtx()
      const len   = Math.floor(ctx.sampleRate * duration)
      const buf   = ctx.createBuffer(1, len, ctx.sampleRate)
      const data  = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.18
      const src   = ctx.createBufferSource()
      src.buffer  = buf
      const gain  = ctx.createGain()
      gain.gain.setValueAtTime(0.45, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      const filt  = ctx.createBiquadFilter()
      filt.type   = 'bandpass'
      filt.frequency.value = 1400
      filt.Q.value = 0.55
      src.connect(filt)
      filt.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    } catch {}
  }, [ensureCtx])

  // ── Play base64 audio from ElevenLabs ──────────────────────
  const playBase64Audio = useCallback((base64, mime = 'audio/mpeg', onEnd) => {
    return new Promise(resolve => {
      try {
        if (currentAudio.current) {
          currentAudio.current.pause()
          currentAudio.current = null
        }
        playClick()
        playStatic(0.12)

        const binary = atob(base64)
        const bytes  = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob   = new Blob([bytes], { type: mime })
        const url    = URL.createObjectURL(blob)

        const audio  = new Audio(url)
        currentAudio.current = audio

        audio.onended = () => {
          playStatic(0.08)
          playClick()
          URL.revokeObjectURL(url)
          currentAudio.current = null
          onEnd?.()
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          currentAudio.current = null
          resolve()
        }
        audio.play().catch(() => resolve())
      } catch {
        resolve()
      }
    })
  }, [playClick, playStatic])

  // ── Browser TTS fallback ────────────────────────────────────
  const playTTSFallback = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    playClick()
    playStatic(0.12)

    const voices = window.speechSynthesis.getVoices()
    const pref   = ['Google UK English Male', 'Daniel', 'Microsoft David', 'Alex', 'Samantha']
    let voice    = null
    for (const name of pref) {
      voice = voices.find(v => v.name.includes(name))
      if (voice) break
    }
    if (!voice) voice = voices.find(v => v.lang?.startsWith('en'))

    const utt     = new SpeechSynthesisUtterance(text)
    if (voice) utt.voice = voice
    utt.rate      = 1.05
    utt.pitch     = 0.85
    utt.volume    = 1.0
    utt.onend     = () => { playStatic(0.07); playClick(); onEnd?.() }
    utt.onerror   = () => { onEnd?.() }
    window.speechSynthesis.speak(utt)
  }, [playClick, playStatic])

  // ── Main: play ATC audio (ElevenLabs or fallback) ──────────
  const playATCVoice = useCallback(async (text, audioBase64, audioMime, onEnd) => {
    ensureCtx() // wake AudioContext on user gesture
    if (audioBase64) {
      await playBase64Audio(audioBase64, audioMime, onEnd)
    } else {
      playTTSFallback(text, onEnd)
    }
  }, [ensureCtx, playBase64Audio, playTTSFallback])

  const stopAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current = null
    }
    window.speechSynthesis?.cancel()
  }, [])

  return { playATCVoice, playClick, playStatic, stopAudio }
}
