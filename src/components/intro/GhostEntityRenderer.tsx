import { useEffect, useRef } from 'react'
import characterUrl from '@assets/character.png'

interface GhostEntityRendererProps {
  zIndex?: number
}

export default function GhostEntityRenderer({ zIndex = 101 }: GhostEntityRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const image = new Image()
    const ghostCanvas = document.createElement('canvas')
    const ghostSize = 280
    ghostCanvas.width = ghostSize
    ghostCanvas.height = ghostSize
    const ghostContext = ghostCanvas.getContext('2d', { willReadFrequently: true })
    let animation = 0
    let frame = 0
    let ready = false

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const buildGhostTexture = () => {
      if (!ghostContext || !image.naturalWidth || !image.naturalHeight) {
        return
      }

      const scale = Math.min(ghostSize / image.naturalWidth, ghostSize / image.naturalHeight) * 0.94
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      const x = (ghostSize - width) * 0.5
      const y = (ghostSize - height) * 0.5

      ghostContext.clearRect(0, 0, ghostSize, ghostSize)
      ghostContext.imageSmoothingEnabled = true
      ghostContext.imageSmoothingQuality = 'low'
      ghostContext.drawImage(image, x, y, width, height)

      const imageData = ghostContext.getImageData(0, 0, ghostSize, ghostSize)
      const data = imageData.data

      for (let row = 0; row < ghostSize; row += 1) {
        for (let col = 0; col < ghostSize; col += 1) {
          const index = (row * ghostSize + col) * 4
          const red = data[index]
          const green = data[index + 1]
          const blue = data[index + 2]
          const sourceAlpha = data[index + 3] / 255
          const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
          const edgeFade = Math.min(col, row, ghostSize - col, ghostSize - row) / 38
          const faceBias = row > ghostSize * 0.14 && row < ghostSize * 0.48 && col > ghostSize * 0.28 && col < ghostSize * 0.72
          const scanline = row % 3 === 0 ? 0.42 : row % 3 === 1 ? 0.88 : 0.62
          const orderedNoise = ((col * 13 + row * 7) % 17) / 17
          const threshold = faceBias ? 0.07 : 0.14
          const visibility = Math.max(0, (luminance - threshold + orderedNoise * 0.08) * (faceBias ? 2.15 : 1.58))
          const alpha = Math.min(sourceAlpha * visibility * scanline * Math.min(edgeFade, 1), faceBias ? 1 : 0.82)

          data[index] = 70 + luminance * 120
          data[index + 1] = 255
          data[index + 2] = 54 + luminance * 48
          data[index + 3] = alpha * 255
        }
      }

      ghostContext.putImageData(imageData, 0, 0)
      ready = true
    }

    const draw = (now: number) => {
      frame += 1
      animation = requestAnimationFrame(draw)

      const width = window.innerWidth
      const height = window.innerHeight
      const time = now * 0.001
      const reveal = 0.38 + (Math.sin(time * 0.17 - 0.9) * 0.5 + 0.5) * 0.38
      const facePulse = 0.5 + Math.sin(time * 0.34 + 1.4) * 0.5
      const blackout = Math.sin(time * 1.53) > 0.986 || frame % 293 < 4
      const baseAlpha = blackout ? 0.12 : reveal
      const ghostWidth = Math.min(width * 0.46, height * 0.74)
      const ghostHeight = ghostWidth
      const x = width * 0.5 - ghostWidth * 0.5 + Math.sin(time * 0.29) * 4
      const y = height * 0.5 - ghostHeight * 0.48 + Math.cos(time * 0.23) * 3
      const jitter = Math.sin(time * 8.6) * 1.1 + (frame % 157 < 4 ? 8 : 0)

      context.clearRect(0, 0, width, height)

      if (!ready) {
        return
      }

      context.save()
      context.globalCompositeOperation = 'screen'
      context.imageSmoothingEnabled = false

      context.globalAlpha = baseAlpha * 0.72
      context.filter = 'blur(8px) brightness(1.28)'
      context.drawImage(ghostCanvas, x - 10 + jitter * 0.25, y + 5, ghostWidth + 20, ghostHeight)

      context.filter = 'blur(1px) contrast(1.95) brightness(1.28)'
      context.globalAlpha = baseAlpha * 1.18
      context.drawImage(ghostCanvas, x + jitter, y, ghostWidth, ghostHeight)

      const faceX = x + ghostWidth * 0.3
      const faceY = y + ghostHeight * 0.14
      const faceW = ghostWidth * 0.48
      const faceH = ghostHeight * 0.4

      context.globalAlpha = baseAlpha * (0.34 + facePulse * 0.5)
      context.filter = 'blur(1.35px) contrast(2.1) brightness(2.05)'
      context.drawImage(
        ghostCanvas,
        ghostSize * 0.27,
        ghostSize * 0.11,
        ghostSize * 0.5,
        ghostSize * 0.45,
        faceX + jitter * 0.22,
        faceY,
        faceW,
        faceH,
      )

      context.globalAlpha = baseAlpha * 0.34
      context.filter = 'blur(0.75px) sepia(1) saturate(3.5) hue-rotate(120deg)'
      context.drawImage(ghostCanvas, x - 2.5 + jitter, y, ghostWidth, ghostHeight)

      context.globalAlpha = baseAlpha * 0.2
      context.filter = 'blur(0.75px) sepia(1) saturate(3) hue-rotate(185deg)'
      context.drawImage(ghostCanvas, x + 3.5 + jitter, y, ghostWidth, ghostHeight)

      context.filter = 'none'
      for (let i = 0; i < 16; i += 1) {
        const sliceY = Math.floor((Math.sin(time * 0.74 + i * 2.31) * 0.5 + 0.5) * ghostSize)
        const sliceHeight = 1 + ((i + frame) % 4)
        const destY = y + (sliceY / ghostSize) * ghostHeight
        const tear = Math.sin(time * 2 + i * 4.2) * 8 + (frame % 181 < 5 ? 18 : 0)

        context.globalAlpha = baseAlpha * (0.14 + (i % 3) * 0.038)
        context.drawImage(
          ghostCanvas,
          0,
          sliceY,
          ghostSize,
          sliceHeight,
          x + tear,
          destY,
          ghostWidth,
          Math.max(1, (sliceHeight / ghostSize) * ghostHeight * 2.1),
        )
      }

      context.globalAlpha = baseAlpha * 0.92
      context.fillStyle = 'rgba(73, 255, 55, 0.14)'
      for (let lineY = y; lineY < y + ghostHeight; lineY += 5) {
        context.fillRect(x - 18, lineY + (frame % 5), ghostWidth + 36, 1)
      }

      context.globalAlpha = baseAlpha * (0.2 + facePulse * 0.28)
      context.fillStyle = 'rgba(220, 255, 210, 0.34)'
      for (let eyeLine = 0; eyeLine < 5; eyeLine += 1) {
        const lineY = faceY + faceH * (0.34 + eyeLine * 0.08)
        context.fillRect(faceX + faceW * 0.18 + jitter * 0.1, lineY, faceW * 0.64, 1)
      }

      context.globalAlpha = baseAlpha * 0.08
      context.fillStyle = 'rgba(220, 255, 210, 0.085)'
      for (let i = 0; i < 38; i += 1) {
        context.fillRect(x + Math.random() * ghostWidth, y + Math.random() * ghostHeight, Math.random() * 3 + 1, 1)
      }

      const cornerGlow = context.createRadialGradient(
        x + ghostWidth * 0.55,
        y + ghostHeight * 0.35,
        ghostWidth * 0.02,
        x + ghostWidth * 0.55,
        y + ghostHeight * 0.38,
        ghostWidth * 0.46,
      )
      cornerGlow.addColorStop(0, `rgba(190, 255, 180, ${0.09 + facePulse * 0.07})`)
      cornerGlow.addColorStop(0.42, 'rgba(73, 255, 55, 0.045)')
      cornerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.globalCompositeOperation = 'screen'
      context.globalAlpha = 1
      context.fillStyle = cornerGlow
      context.fillRect(x - ghostWidth * 0.2, y - ghostHeight * 0.2, ghostWidth * 1.12, ghostHeight)

      const mask = context.createRadialGradient(
        x + ghostWidth * 0.53,
        y + ghostHeight * 0.34,
        ghostWidth * 0.16,
        x + ghostWidth * 0.52,
        y + ghostHeight * 0.42,
        ghostWidth * 0.72,
      )
      mask.addColorStop(0, 'rgba(0, 0, 0, 0)')
      mask.addColorStop(0.56, 'rgba(0, 0, 0, 0.04)')
      mask.addColorStop(1, 'rgba(0, 0, 0, 0.34)')
      context.globalCompositeOperation = 'destination-out'
      context.globalAlpha = 0.22
      context.fillStyle = mask
      context.fillRect(0, 0, width, height)

      context.restore()
    }

    image.onload = buildGhostTexture
    image.src = characterUrl
    resize()
    draw(performance.now())
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
        opacity: 1,
        mixBlendMode: 'screen',
      }}
    />
  )
}
