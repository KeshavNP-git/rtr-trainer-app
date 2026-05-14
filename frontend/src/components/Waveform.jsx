import { useEffect, useRef } from 'react'
import styles from './Waveform.module.css'

export default function Waveform({ active = false }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      const W = canvas.clientWidth
      const H = 38
      canvas.width  = W
      canvas.height = H
      ctx.clearRect(0, 0, W, H)

      if (!active) {
        // flat line
        ctx.strokeStyle = 'rgba(0,255,136,0.15)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, H / 2)
        ctx.lineTo(W, H / 2)
        ctx.stroke()
        return
      }

      // animated noisy wave
      ctx.strokeStyle = 'rgba(0,255,136,0.65)'
      ctx.lineWidth   = 1.5
      ctx.beginPath()
      for (let x = 0; x < W; x++) {
        const amp = H * 0.38
        const y   = H / 2 + (Math.random() - 0.5) * amp * 2
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    if (active) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      cancelAnimationFrame(rafRef.current)
      draw() // draw flat line once
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.label}>
        {active ? (
          <><span className={styles.dot} /> SIGNAL ACTIVE</>
        ) : (
          <span style={{ opacity: .4 }}>SQUELCH CLOSED</span>
        )}
      </div>
    </div>
  )
}
