import { useEffect, useRef, useState } from 'react'
import charcter02Url from '@assets/charcter02_intro.png'
import AnalogVHSOverlay from './AnalogVHSOverlay'
import GhostEntityRenderer from './GhostEntityRenderer'

const DURATION_MS = 3000
const GLYPHS = '01ABCDEFabcdef[]{}()<>=_*#/\\|:;!?$%&+-~^'
const HEX = '0123456789ABCDEF'
const MAX_PIXEL_RATIO = 1
const FRAME_INTERVAL_MS = 1000 / 30

const LOG_FRAGMENTS = [
  'kernel panic: recursive node failure',
  'memory violation at virtual frame 0x%HEX%',
  'segmentation fault // neural_stack_overflow',
  'signal recursion detected in /dev/sim0',
  'simulation integrity lost',
  'vm_fault: page not present, pte=%HEX%',
  'panic(cpu 0 caller %HEX%): trap type 14',
  'init: cannot mount corrupted filesystem',
  'syscall_table[%NUM%] -> NULL_VECTOR',
  'rdmsr 0x%HEX% ; illegal state transition',
  'mov eax, [%HEX%] ; xor edx, edx ; int 0x80',
  'struct vframe *vf = collapse(ptr->node)',
  'if (memory->ghost) goto recursive_halt;',
  '#define PG_TABLE_SIZE 0x%HEX%',
  'warning: virtual frame collapse imminent',
  'inode %NUM%: orphaned from root simulation',
  'neural bus parity mismatch',
  'STACK TRACE: %HEX% -> %HEX% -> %HEX%',
  'fsck.vr: unrecoverable symbolic loop',
  'fatal: forbidden terminal woke up',
  'memcpy(void *dst, const void *src, %NUM%)',
  'asm volatile("hlt"); // failed',
  'node[%NUM%].child = node[%NUM%].parent',
  'EIP=%HEX% ESP=%HEX% EFLAGS=00010246',
  'VM DIAGNOSTIC: observer process detached',
  'page fault in nonpaged simulation area',
  'SIGRECURSE caught, dumping core image',
  'lost carrier on ttyS%NUM%',
  'execve("/bin/ghost", argv, envp) = -1',
  'CRITICAL: human-readable layer decaying',
]

type TextBlock = {
  x: number
  y: number
  width: number
  fontSize: number
  alpha: number
  scrollSpeed: number
  phase: number
  lines: string[]
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function pickChar(source: string) {
  return source[Math.floor(Math.random() * source.length)]
}

function makeHex(length = 8) {
  return Array.from({ length }, () => pickChar(HEX)).join('')
}

function makeCorruptToken(length: number) {
  return Array.from({ length }, () => pickChar(GLYPHS)).join('')
}

function makeLine(index: number) {
  const source = pick(LOG_FRAGMENTS)
  const line = source
    .replace(/%HEX%/g, makeHex(Math.random() > 0.58 ? 8 : 4))
    .replace(/%NUM%/g, String(Math.floor(rand(0, 4096))).padStart(4, '0'))

  if (index % 9 === 0) {
    return `${makeHex(4)}:${makeHex(4)}  ${line}  ${makeCorruptToken(Math.floor(rand(4, 18)))}`
  }

  if (index % 13 === 0) {
    return `${makeCorruptToken(Math.floor(rand(12, 34)))}   // BUS ERROR`
  }

  return line
}

function corruptText(text: string, intensity: number, seed: number) {
  let result = ''

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const noise = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    const sample = noise - Math.floor(noise)

    if (sample < intensity * 0.11) {
      result += pickChar(GLYPHS)
    } else if (sample > 1 - intensity * 0.055) {
      result += `${char}${pickChar(GLYPHS)}`
    } else if (sample > 1 - intensity * 0.035) {
      result += ''
    } else {
      result += char
    }
  }

  return result
}

function buildBlocks(width: number, height: number) {
  const blockCount = Math.max(8, Math.floor(width / 110))

  return Array.from({ length: blockCount }, (_, blockIndex) => {
    const fontSize = rand(10, 14)
    const lineCount = Math.ceil(height / (fontSize * 1.24)) + Math.floor(rand(6, 16))

    return {
      x: rand(-width * 0.08, width * 0.94),
      y: rand(-height * 0.28, height * 0.12),
      width: rand(width * 0.2, width * 0.52),
      fontSize,
      alpha: rand(0.08, 0.32),
      scrollSpeed: rand(3, 23) * (Math.random() > 0.24 ? 1 : -0.35),
      phase: rand(0, Math.PI * 2),
      lines: Array.from({ length: lineCount }, (_, lineIndex) => makeLine(blockIndex * 101 + lineIndex)),
    }
  })
}

interface ErrorScreenProps {
  durationMs?: number
  breakDurationMs?: number
  onComplete?: () => void
}

export default function ErrorScreen({ durationMs = DURATION_MS, breakDurationMs = 0, onComplete }: ErrorScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const [isBreaking, setIsBreaking] = useState(false)
  const [breakProgressState, setBreakProgressState] = useState(0)
  const shouldShowBreakGhost = isBreaking || breakProgressState > 0

  // Preload charcter02 immediately so it's in browser cache before the transition
  useEffect(() => {
    const img = new Image()
    img.src = charcter02Url
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    let animationFrame = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    let startTime = performance.now()
    let lastDrawTime = 0
    let completeTimer = 0
    let lastBreakProgress = 0
    let blocks = buildBlocks(width, height)
    const feedbackCanvas = document.createElement('canvas')
    const feedbackContext = feedbackCanvas.getContext('2d')

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.fillStyle = '#000'
      context.fillRect(0, 0, width, height)
      feedbackCanvas.width = canvas.width
      feedbackCanvas.height = canvas.height
      blocks = buildBlocks(width, height)
    }

    const drawTextBlock = (block: TextBlock, elapsed: number, intensity: number, index: number) => {
      const lineHeight = block.fontSize * 1.18
      const scroll = (elapsed * 0.001 * block.scrollSpeed + Math.sin(elapsed * 0.001 + block.phase) * 14) % lineHeight
      const jitter = intensity > 0.72 && (index + Math.floor(elapsed / 70)) % 5 === 0 ? rand(-8, 8) : 0

      context.save()
      context.translate(
        block.x + Math.sin(elapsed * 0.00033 + block.phase) * 18 + jitter,
        block.y + scroll,
      )
      context.beginPath()
      context.rect(-20, -height * 0.4, block.width, height * 1.6)
      context.clip()
      context.font = `${block.fontSize}px "Courier New", Consolas, monospace`
      context.textBaseline = 'top'
      context.shadowColor = `rgba(73, 255, 55, ${0.16 + intensity * 0.22})`
      context.shadowBlur = 4 + intensity * 9

      block.lines.forEach((line, lineIndex) => {
        const y = lineIndex * lineHeight
        const rowPulse = Math.sin(elapsed * 0.006 + lineIndex * 1.7 + block.phase) * 0.5 + 0.5
        const alpha = block.alpha * (0.38 + rowPulse * 0.48) * (0.72 + intensity * 0.28)
        const damaged = intensity > 0.18 ? corruptText(line, intensity, lineIndex * 31 + index * 17 + Math.floor(elapsed / 48)) : line

        context.globalAlpha = alpha
        context.fillStyle = '#56ff40'
        context.fillText(damaged, 0, y)

        if (intensity > 0.35 && lineIndex % 6 === 0) {
          context.globalAlpha = alpha * 0.18
          context.fillStyle = '#8ffff4'
          context.fillText(damaged, 1.5 + intensity * 4, y)
          context.fillStyle = '#183f18'
          context.fillText(damaged, -1.2 - intensity * 3, y)
        }
      })

      context.restore()
    }

    const drawTears = (elapsed: number, intensity: number) => {
      const tearCount = Math.floor(1 + intensity * 5)

      for (let i = 0; i < tearCount; i += 1) {
        const y = (Math.sin(elapsed * 0.0017 + i * 21.1) * 0.5 + 0.5) * height
        const tearHeight = rand(1, 4 + intensity * 18)
        const xOffset = rand(-80, 80) * intensity
        context.globalAlpha = rand(0.025, 0.09) * intensity
        context.fillStyle = i % 3 === 0 ? '#aaff9f' : '#1aff16'
        context.fillRect(xOffset, y, width + Math.abs(xOffset), tearHeight)

        if (intensity > 0.62) {
          context.globalAlpha = rand(0.035, 0.075) * intensity
          context.fillRect(rand(0, width * 0.86), y + tearHeight + rand(2, 18), rand(30, width * 0.38), rand(4, 28))
        }
      }
    }

    const drawScanlines = (elapsed: number, intensity: number) => {
      context.globalAlpha = 0.42
      context.fillStyle = 'rgba(0, 0, 0, 0.48)'
      for (let y = Math.floor(elapsed / 25) % 4; y < height; y += 4) {
        context.fillRect(0, y, width, 1)
      }

      context.globalAlpha = 0.055 + intensity * 0.085
      context.fillStyle = '#4aff36'
      const trackingY = (elapsed * (0.06 + intensity * 0.28)) % height
      context.fillRect(0, trackingY, width, 2 + intensity * 4)
    }

    const drawNoise = (intensity: number) => {
      const amount = Math.floor(35 + intensity * 160)

      for (let i = 0; i < amount; i += 1) {
        const alpha = rand(0.01, 0.045) * (0.35 + intensity)
        context.globalAlpha = alpha
        context.fillStyle = Math.random() > 0.82 ? '#d7ffd2' : '#39ff25'
        context.fillRect(rand(0, width), rand(0, height), rand(0.6, 2.8 + intensity * 5), rand(0.6, 2.2))
      }
    }

    const drawVignette = (intensity: number) => {
      const gradient = context.createRadialGradient(width * 0.5, height * 0.48, height * 0.16, width * 0.5, height * 0.5, width * 0.78)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      gradient.addColorStop(0.5, 'rgba(0, 12, 0, 0.16)')
      gradient.addColorStop(1, `rgba(0, 0, 0, ${0.78 + intensity * 0.12})`)
      context.globalAlpha = 1
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
    }

    const draw = (now: number) => {
      animationFrame = requestAnimationFrame(draw)
      if (now - lastDrawTime < FRAME_INTERVAL_MS) return
      lastDrawTime = now

      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const breakProgress = breakDurationMs > 0 ? Math.min(Math.max((elapsed - durationMs) / breakDurationMs, 0), 1) : 0
      const isBreaking = breakProgress > 0
      if (
        Math.abs(breakProgress - lastBreakProgress) > 0.015 ||
        breakProgress === 0 ||
        breakProgress === 1
      ) {
        lastBreakProgress = breakProgress
        setBreakProgressState(breakProgress)
      }
      const intensity = Math.min(1, progress * progress * 1.55)
      const peak = Math.max(0, (progress - 0.72) / 0.28)
      const rupture = Math.sin(breakProgress * Math.PI)
      const frameJitterX =
        Math.sin(elapsed * 0.03) * intensity * 2.2 +
        (peak > 0 ? rand(-4, 4) * peak : 0) +
        (isBreaking ? Math.sin(elapsed * 0.08) * rupture * 18 + rand(-8, 8) * rupture : 0)
      const frameJitterY =
        Math.cos(elapsed * 0.021) * intensity * 1.5 +
        (peak > 0 ? rand(-3, 3) * peak : 0) +
        (isBreaking ? Math.cos(elapsed * 0.063) * rupture * 6 : 0)

      context.save()
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = 1
      context.fillStyle = `rgba(0, 0, 0, ${isBreaking ? 0.22 + breakProgress * 0.18 : 0.48 - intensity * 0.08})`
      context.fillRect(0, 0, width, height)
      if (isBreaking) {
        const squeeze = 1 - rupture * 0.055
        context.translate(width * 0.5, height * 0.5)
        context.scale(1 + rupture * 0.018, squeeze)
        context.translate(-width * 0.5, -height * 0.5)
      }
      context.translate(frameJitterX, frameJitterY)

      context.globalCompositeOperation = 'source-over'
      blocks.forEach((block, index) => drawTextBlock(block, elapsed, intensity, index))

      context.globalCompositeOperation = 'screen'
      drawTears(elapsed, intensity)
      drawNoise(intensity)
      drawScanlines(elapsed, intensity)

      if (peak > 0.1 || isBreaking) {
        context.globalAlpha = isBreaking ? rupture * 0.16 : peak * 0.1
        context.fillStyle = '#73ff5d'
        context.font = `${Math.max(18, width * 0.021)}px "Courier New", Consolas, monospace`
        context.fillText(`PANIC: SIMULATION HEARTBEAT ${makeCorruptToken(12)}`, rand(-20, width * 0.42), height * rand(0.34, 0.68))
      }

      drawVignette(intensity)
      context.restore()

      if (isBreaking && feedbackContext) {
        feedbackContext.drawImage(canvas, 0, 0)
        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.globalCompositeOperation = 'source-over'
        context.fillStyle = `rgba(0, 0, 0, ${0.08 + breakProgress * 0.12})`
        context.fillRect(0, 0, canvas.width, canvas.height)

        const bandCount = Math.floor(12 + rupture * 30)
        for (let band = 0; band < bandCount; band += 1) {
          const sourceY = Math.floor(rand(0, canvas.height))
          const sourceHeight = Math.floor(rand(2, 18 + rupture * 46) * pixelRatio)
          const wave = Math.sin(sourceY * 0.017 + elapsed * 0.026) * rupture
          const shift = Math.floor((wave * 74 + rand(-28, 28) * rupture) * pixelRatio)
          const crush = 1 + rand(-0.24, 0.28) * rupture
          const destY = Math.max(0, Math.min(canvas.height - sourceHeight, sourceY + Math.floor(rand(-8, 8) * rupture * pixelRatio)))

          context.globalAlpha = 0.72 + rupture * 0.28
          context.drawImage(
            feedbackCanvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            shift,
            destY,
            canvas.width * crush,
            sourceHeight,
          )
        }

        context.globalCompositeOperation = 'screen'
        context.globalAlpha = 0.12 + rupture * 0.34
        context.fillStyle = '#e9ffe2'
        for (let line = 0; line < 5; line += 1) {
          const y = Math.floor((height * (0.18 + line * 0.17) + Math.sin(elapsed * 0.02 + line) * 16) * pixelRatio)
          context.fillRect(0, y, canvas.width, Math.max(1, Math.floor((1 + rupture * 3) * pixelRatio)))
        }

        if (breakProgress > 0.68) {
          context.globalCompositeOperation = 'source-over'
          context.globalAlpha = (breakProgress - 0.68) / 0.32
          context.fillStyle = '#000'
          context.fillRect(0, 0, canvas.width, canvas.height)
        }

        context.restore()
      }

    }

    resize()
    startTime = performance.now()
    setIsBreaking(false)
    setBreakProgressState(0)
    completeTimer = window.setTimeout(() => onCompleteRef.current?.(), durationMs + breakDurationMs)
    const breakTimer = window.setTimeout(() => setIsBreaking(true), durationMs)
    animationFrame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.clearTimeout(completeTimer)
      window.clearTimeout(breakTimer)
      window.removeEventListener('resize', resize)
    }
  }, [breakDurationMs, durationMs])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: '#000',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
      filter: 'contrast(1.08) saturate(1.08) brightness(0.86)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(73,255,55,0.035), transparent 14%, rgba(0,255,210,0.025) 48%, transparent 84%, rgba(73,255,55,0.03)), repeating-linear-gradient(to bottom, rgba(170,255,150,0.055) 0, rgba(170,255,150,0.055) 1px, transparent 1px, transparent 5px)',
          mixBlendMode: 'screen',
          opacity: 0.38,
        }}
      />
      <GhostEntityRenderer
        zIndex={101}
        imageUrl={shouldShowBreakGhost ? charcter02Url : undefined}
        preloadImageUrl={charcter02Url}
        alphaBoost={shouldShowBreakGhost ? 1.6 : 1}
        breakDurationMs={breakDurationMs}
        breakProgress={breakProgressState}
      />
      <div className="signal-lost-panel" aria-hidden="true">
        <span>-- SIGNAL LOST</span>
        <span>{shouldShowBreakGhost ? '[00:00:03]' : '[00:00:01]'}</span>
        <span>CONNECTION LOST</span>
      </div>
      <AnalogVHSOverlay zIndex={102} />
    </div>
  )
}
