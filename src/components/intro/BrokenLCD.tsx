import { useEffect, useRef } from 'react'

interface Props {
  onComplete: () => void
  onRevealSpace?: () => void
  isRevealingSpace?: boolean
}

interface CoverRect {
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
}

const BASE_IMAGE_URL = '/broken-lcd-source.png'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const randomRange = (min: number, max: number) => min + Math.random() * (max - min)

function gaussian() {
  let u = 0
  let v = 0

  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function getCoverRect(img: HTMLImageElement, width: number, height: number): CoverRect {
  const imageRatio = img.naturalWidth / img.naturalHeight
  const canvasRatio = width / height

  if (imageRatio > canvasRatio) {
    const sh = img.naturalHeight
    const sw = sh * canvasRatio
    return {
      sx: (img.naturalWidth - sw) / 2,
      sy: 0,
      sw,
      sh,
      dx: 0,
      dy: 0,
      dw: width,
      dh: height,
    }
  }

  const sw = img.naturalWidth
  const sh = sw / canvasRatio
  return {
    sx: 0,
    sy: (img.naturalHeight - sh) / 2,
    sw,
    sh,
    dx: 0,
    dy: 0,
    dw: width,
    dh: height,
  }
}

function crushPhotographicPixels(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722
    const crushed = clamp((luminance - 18) * 1.72, 0, 255)
    const hard = crushed < 26 ? 0 : crushed > 196 ? 255 : crushed
    const grain = Math.random() > 0.985 && hard > 36 ? randomRange(18, 62) : 0

    data[i] = clamp(hard + grain + (r - luminance) * 0.12, 0, 255)
    data[i + 1] = clamp(hard + grain + (g - luminance) * 0.08, 0, 255)
    data[i + 2] = clamp(hard + grain + (b - luminance) * 0.12, 0, 255)
  }

  ctx.putImageData(image, 0, 0)
}

function buildBrightEdgeMask(
  target: CanvasRenderingContext2D,
  source: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const image = source.getImageData(0, 0, width, height)
  const out = target.createImageData(width, height)
  const data = image.data
  const edges = out.data

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4
      const right = (y * width + x + 1) * 4
      const down = ((y + 1) * width + x) * 4
      const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
      const lumRight = data[right] * 0.2126 + data[right + 1] * 0.7152 + data[right + 2] * 0.0722
      const lumDown = data[down] * 0.2126 + data[down + 1] * 0.7152 + data[down + 2] * 0.0722
      const edge = Math.abs(lum - lumRight) + Math.abs(lum - lumDown)

      if (lum > 74 && edge > 32) {
        const alpha = clamp(edge * 1.4, 0, 220)
        edges[i] = 255
        edges[i + 1] = 255
        edges[i + 2] = 255
        edges[i + 3] = alpha
      }
    }
  }

  target.putImageData(out, 0, 0)
}

function prepareSource(
  ctx: CanvasRenderingContext2D,
  edgeCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number
) {
  const cover = getCoverRect(img, width, height)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, cover.sx, cover.sy, cover.sw, cover.sh, cover.dx, cover.dy, cover.dw, cover.dh)
  crushPhotographicPixels(ctx, width, height)

  edgeCtx.clearRect(0, 0, width, height)
  buildBrightEdgeMask(edgeCtx, ctx, width, height)
}

function drawVerticalPixelDrag(
  target: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
  intensity: number,
  dpr: number
) {
  const streamCount = Math.floor(80 + intensity * 260)
  const centerY = height * 0.34

  target.save()
  target.globalCompositeOperation = 'lighter'

  for (let i = 0; i < streamCount; i += 1) {
    const centerBias = clamp(gaussian() * width * 0.14, -width * 0.43, width * 0.43)
    const x = clamp(width * 0.5 + centerBias + randomRange(-12, 12) * dpr, 0, width - 2)
    const y = clamp(centerY + gaussian() * height * 0.15, height * 0.04, height * 0.68)
    const w = randomRange(1, Math.random() > 0.72 ? 4 : 2.2) * dpr
    const h = randomRange(5, Math.random() > 0.76 ? 54 : 18) * dpr
    const fall = randomRange(24, height * 0.72) * intensity
    const broken = Math.random() > 0.7
    const segments = broken ? Math.floor(randomRange(2, 6)) : 1

    target.globalAlpha = randomRange(0.12, 0.82) * intensity

    for (let segment = 0; segment < segments; segment += 1) {
      const segmentY = y + (fall / segments) * segment + randomRange(0, 16) * dpr
      const segmentH = h * randomRange(0.5, 1.45)
      const stretch = segmentH + randomRange(24, height * 0.44) * intensity
      const drift = randomRange(-4, 4) * dpr

      target.drawImage(source, x, y, w, segmentH, x + drift, segmentY, w, stretch)
    }
  }

  target.restore()
  target.globalAlpha = 1
}

function tearFramebufferRows(
  target: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
  intensity: number,
  dpr: number
) {
  const bands = Math.floor(18 + intensity * 52)

  for (let i = 0; i < bands; i += 1) {
    const y = randomRange(height * 0.02, height * 0.96)
    const h = randomRange(1, Math.random() > 0.68 ? 34 : 8) * dpr
    const shift = randomRange(-width * 0.18, width * 0.18) * intensity
    const squash = randomRange(0.72, 1.18)
    const sourceX = shift > 0 ? 0 : Math.abs(shift)
    const sourceW = width - Math.abs(shift)
    const destX = shift > 0 ? shift : 0

    target.globalAlpha = randomRange(0.32, 0.96)
    target.drawImage(
      source,
      sourceX,
      y,
      sourceW,
      h,
      destX,
      y + randomRange(-2, 2) * dpr,
      sourceW * squash,
      h
    )

    if (Math.random() > 0.72) {
      target.globalAlpha = randomRange(0.08, 0.24) * intensity
      target.fillStyle = '#fff'
      target.fillRect(destX, y, sourceW * randomRange(0.08, 0.38), Math.max(1, dpr))
    }
  }

  target.globalAlpha = 1
}

function corruptPixelBlocks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  elapsed: number
) {
  if (Math.floor(elapsed / 58) % 2 !== 0) return

  const blocks = Math.floor(3 + intensity * 8)

  for (let block = 0; block < blocks; block += 1) {
    const w = Math.floor(randomRange(width * 0.08, width * 0.34))
    const h = Math.floor(randomRange(4, height * 0.05))
    const x = Math.floor(randomRange(width * 0.02, width - w))
    const y = Math.floor(randomRange(height * 0.12, height * 0.9))
    const image = ctx.getImageData(x, y, w, h)
    const data = image.data

    for (let i = 0; i < data.length; i += 4) {
      const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
      const crush = lum > 106 ? 255 : lum < 48 ? 0 : lum * randomRange(0.45, 1.35)

      data[i] = clamp(crush + randomRange(-18, 42) * intensity, 0, 255)
      data[i + 1] = clamp(crush + randomRange(-12, 26) * intensity, 0, 255)
      data[i + 2] = clamp(crush + randomRange(-4, 52) * intensity, 0, 255)
      data[i + 3] = 255
    }

    ctx.putImageData(image, x + Math.floor(randomRange(-42, 42) * intensity), y)
  }
}

function applySelectiveRgbSplit(
  ctx: CanvasRenderingContext2D,
  edgeCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  intensity: number,
  dpr: number
) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  ctx.globalAlpha = 0.16 * intensity
  ctx.filter = 'sepia(1) saturate(5) hue-rotate(305deg)'
  ctx.drawImage(edgeCanvas, 1.4 * dpr, 0, width, height)

  ctx.globalAlpha = 0.2 * intensity
  ctx.filter = 'sepia(1) saturate(5) hue-rotate(145deg)'
  ctx.drawImage(edgeCanvas, -1.7 * dpr, 0, width, height)

  ctx.restore()
  ctx.filter = 'none'
  ctx.globalAlpha = 1
}

function addPanelScan(ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) {
  ctx.globalCompositeOperation = 'source-over'

  for (let y = 0; y < height; y += Math.max(2, Math.floor(3 * dpr))) {
    ctx.fillStyle = y % 15 === 0 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, y, width, Math.max(1, dpr))
  }
}

export default function BrokenLCD({ onComplete, onRevealSpace, isRevealingSpace = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onCompleteRef = useRef(onComplete)
  const onRevealSpaceRef = useRef(onRevealSpace)
  onCompleteRef.current = onComplete
  onRevealSpaceRef.current = onRevealSpace

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let completed = false
    let disposed = false
    let imageReady = false
    let sourceReady = false
    let revealedSpace = false

    const img = new Image()
    img.onload = () => {
      imageReady = true
    }
    img.src = BASE_IMAGE_URL

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = window.innerWidth
    const cssH = window.innerHeight
    const width = Math.floor(cssW * dpr)
    const height = Math.floor(cssH * dpr)

    canvas.width = width
    canvas.height = height
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    canvas.style.background = '#000'

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const source = document.createElement('canvas')
    source.width = width
    source.height = height
    const sourceCtx = source.getContext('2d', { alpha: false })!

    const edge = document.createElement('canvas')
    edge.width = width
    edge.height = height
    const edgeCtx = edge.getContext('2d')!

    const frame = document.createElement('canvas')
    frame.width = width
    frame.height = height
    const frameCtx = frame.getContext('2d', { alpha: false })!

    const scratch = document.createElement('canvas')
    scratch.width = width
    scratch.height = height
    const scratchCtx = scratch.getContext('2d', { alpha: false })!

    const memory = document.createElement('canvas')
    memory.width = width
    memory.height = height
    const memoryCtx = memory.getContext('2d', { alpha: false })!

    sourceCtx.fillStyle = '#000'
    sourceCtx.fillRect(0, 0, width, height)
    frameCtx.fillStyle = '#000'
    frameCtx.fillRect(0, 0, width, height)
    memoryCtx.fillStyle = '#000'
    memoryCtx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    const updateSource = () => {
      if (!imageReady || sourceReady || !img.naturalWidth) return
      prepareSource(sourceCtx, edgeCtx, img, width, height)
      sourceReady = true
    }

    const start = performance.now()
    const total = 3350
    const revealSpaceAt = 2050
    const voidStart = 2720

    const render = (now: number) => {
      if (disposed) return

      updateSource()

      const elapsed = now - start
      const t = clamp(elapsed / total, 0, 1)
      const arrival = clamp(elapsed / 360, 0, 1)
      const collapse = clamp((elapsed - 120) / 1180, 0, 1)
      const violence = clamp((elapsed - 420) / 760, 0, 1)
      const voidFade = clamp((elapsed - voidStart) / (total - voidStart), 0, 1)
      const skipFrame = violence > 0.45 && Math.floor(elapsed / 83) % 6 === 0

      if (!revealedSpace && elapsed >= revealSpaceAt) {
        revealedSpace = true
        onRevealSpaceRef.current?.()
      }

      if (!skipFrame) {
        frameCtx.globalCompositeOperation = 'source-over'
        frameCtx.fillStyle = '#000'
        frameCtx.fillRect(0, 0, width, height)

        if (sourceReady) {
          frameCtx.globalAlpha = 0.72 + arrival * 0.28
          frameCtx.drawImage(source, 0, 0)
          frameCtx.globalAlpha = 1

          scratchCtx.globalCompositeOperation = 'source-over'
          scratchCtx.drawImage(frame, 0, 0)

          frameCtx.globalAlpha = 0.24 + collapse * 0.28
          frameCtx.drawImage(
            memory,
            randomRange(-3, 3) * dpr * collapse,
            randomRange(1, 10) * dpr * collapse
          )
          frameCtx.globalAlpha = 1

          drawVerticalPixelDrag(frameCtx, source, width, height, 0.42 + collapse * 0.58, dpr)
          tearFramebufferRows(frameCtx, scratch, width, height, 0.3 + violence * 0.7, dpr)
          corruptPixelBlocks(frameCtx, width, height, violence, elapsed)
        }
      }

      memoryCtx.globalCompositeOperation = 'source-over'
      memoryCtx.globalAlpha = sourceReady ? 0.55 : 1
      memoryCtx.drawImage(
        frame,
        randomRange(-2, 2) * dpr * collapse,
        randomRange(1, 7) * dpr * collapse
      )
      memoryCtx.globalAlpha = 0.18 + collapse * 0.12
      memoryCtx.drawImage(frame, randomRange(-5, 5) * dpr * violence, 0)
      memoryCtx.globalAlpha = 1

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(frame, 0, 0)

      if (sourceReady) {
        applySelectiveRgbSplit(ctx, edge, width, height, 0.42 + violence * 0.58, dpr)
      }

      addPanelScan(ctx, width, height, dpr)

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(0,0,0,${0.04 + violence * 0.1})`
      ctx.fillRect(0, 0, width, height)

      if (voidFade > 0) {
        ctx.fillStyle = `rgba(0,0,0,${voidFade})`
        ctx.fillRect(0, 0, width, height)
      }

      if (t < 1) {
        raf = requestAnimationFrame(render)
      } else if (!completed) {
        completed = true
        onCompleteRef.current()
      }
    }

    img.onerror = () => {
      imageReady = false
    }

    raf = requestAnimationFrame(render)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        background: '#000',
        opacity: isRevealingSpace ? 0 : 1,
        mixBlendMode: isRevealingSpace ? 'screen' : 'normal',
        transition: 'opacity 1.18s steps(8, end)',
        zIndex: 90,
      }}
    />
  )
}
