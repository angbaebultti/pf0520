import { useEffect, useRef } from 'react'

interface AnalogVHSOverlayProps {
  zIndex?: number
}

export default function AnalogVHSOverlay({ zIndex = 102 }: AnalogVHSOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    let frame = 0
    let animation = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = () => {
      frame += 1
      animation = requestAnimationFrame(draw)

      const width = window.innerWidth
      const height = window.innerHeight
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'

      context.fillStyle = 'rgba(80, 255, 70, 0.022)'
      for (let y = frame % 4; y < height; y += 4) {
        context.fillRect(0, y, width, 1)
      }

      context.fillStyle = 'rgba(235, 255, 225, 0.024)'
      for (let i = 0; i < 64; i += 1) {
        context.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2.2 + 0.5, 1)
      }

      if (frame % 41 < 4) {
        const tearY = Math.random() * height
        const offset = Math.sin(frame * 0.7) * 18
        context.fillStyle = 'rgba(180, 255, 170, 0.075)'
        context.fillRect(offset, tearY, width, Math.random() * 2 + 1)
      }

      const vignette = context.createRadialGradient(width * 0.5, height * 0.5, width * 0.18, width * 0.5, height * 0.5, width * 0.76)
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(0.66, 'rgba(0, 0, 0, 0.28)')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.84)')
      context.globalCompositeOperation = 'source-over'
      context.fillStyle = vignette
      context.fillRect(0, 0, width, height)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animation)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity: 0.82,
        mixBlendMode: 'screen',
      }}
    />
  )
}
