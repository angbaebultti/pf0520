import { useEffect, useRef, useState } from 'react'

type FailurePhase = 'typing' | 'stretch' | 'corrupt'

const STATIC_LINES = [
  '404 ERROR - PAGE NOT FOUND',
  'AUTOSAVED // PAGE RETRIEVAL FAILURE',
  'LOT ART: ATTEMPTED TO LOAD RESOURCE (/M PAGE)',
  'SYSTEM TRACE:',
  '0033 LOAD /HOME',
  '0042 RUN /ABOUT',
  '0051 RUN /WORKS',
  'IF LOST == TRUE THEN',
  '  PRINT "ART IS NEVER LOST - ONLY MISPLACED"',
  'EXCEPTION MALLOC',
  'HEAP MEMORY NOT ALLOCATED',
  'REDIRECT PATH UNDEFINED',
  '0091 ALLOCATE MEMORY BLOCK (PAGE_DATA)',
  '0092 DATA STREAM EMPTY',
  '0093 CONNECTION TIMEOUT (TIMEOUT)',
  '009F CACHE FLUSHED BY ANON',
  '00A5 ARTIFACT DETECTED',
  'ERROR 4P41F: RESOURCE NOT FOUND',
  'CAUSE: UNKNOWN',
  'LEVEL: CRITICAL',
  'PAGE CORRUPTED',
  'RECOVERY STEPS:',
]

const TYPING_LINES = ['TRY ABORT', 'TRY RETRY', 'TRY IGNORE → FAILED', 'SYSTEM HALT...']
const TYPING_FULL = TYPING_LINES.join('\n')
const CORRUPT_CHARS = [
  '#',
  '%',
  '&',
  '/',
  '\\',
  '|',
  '!',
  '0',
  '1',
  '2',
  '7',
  '?',
  '=',
  '+',
  ':',
  ';',
  '[',
  ']',
]
const BROKEN_SPACES = [' ', '.', '_', '  ', '']

function corruptLine(line: string, seed: number, intensity: number) {
  return line
    .split('')
    .map((char, index) => {
      if (char === ' ') {
        const spaceNoise = Math.sin((index + seed) * 1.8) * 0.5 + 0.5
        return spaceNoise < intensity ? BROKEN_SPACES[(index + seed) % BROKEN_SPACES.length] : char
      }

      const wave = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453
      const noise = wave - Math.floor(wave)

      if (noise < intensity) {
        return CORRUPT_CHARS[(index + seed) % CORRUPT_CHARS.length]
      }

      if (noise > 1 - intensity * 0.28) {
        return ''
      }

      if (noise > 1 - intensity * 0.62) {
        return `${char}${CORRUPT_CHARS[(index * 3 + seed) % CORRUPT_CHARS.length]}`
      }

      return char
    })
    .join('')
}

function collapseLine(line: string, seed: number, intensity: number) {
  const damaged = corruptLine(line, seed, intensity)
  const targetLength = Math.max(line.length, 8)

  if (damaged.length > targetLength + 4) {
    return damaged.slice(0, targetLength + 4)
  }

  if (damaged.length < targetLength - 2) {
    const fill = Array.from({ length: targetLength - damaged.length }, (_, index) => {
      return CORRUPT_CHARS[(seed + index * 5) % CORRUPT_CHARS.length]
    }).join('')
    return `${damaged}${fill}`
  }

  return damaged
}

function repeatedSmear(line: string, seed: number, repeats: number, intensity: number) {
  const source = line.trim() || 'SYSTEM HALT'
  return Array.from({ length: repeats }, (_, index) =>
    collapseLine(source, seed + index * 7, intensity + index * 0.015)
  ).join('\n')
}

interface Props {
  onComplete: () => void
}

export default function ErrorScreen({ onComplete }: Props) {
  const [typedCount, setTypedCount] = useState(0)
  const [cursorOn, setCursorOn] = useState(true)
  const [failurePhase, setFailurePhase] = useState<FailurePhase>('typing')
  const [corruptFrame, setCorruptFrame] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Typing animation, followed by stretch and corruption phases before BrokenLCD.
  useEffect(() => {
    if (typedCount >= TYPING_FULL.length) {
      setFailurePhase('stretch')
      const corruptId = setTimeout(() => setFailurePhase('corrupt'), 280)
      const completeId = setTimeout(() => onCompleteRef.current(), 1120)
      return () => {
        clearTimeout(corruptId)
        clearTimeout(completeId)
      }
    }
    const id = setTimeout(() => setTypedCount(c => c + 1), 48)
    return () => clearTimeout(id)
  }, [typedCount])

  // During failure the framebuffer keeps redrawing bad memory instead of freezing on one corruption pass.
  useEffect(() => {
    if (failurePhase === 'typing') return

    const id = setInterval(() => setCorruptFrame(frame => frame + 1), 42)
    return () => clearInterval(id)
  }, [failurePhase])

  const displayLines = TYPING_FULL.slice(0, typedCount).split('\n')
  const allVisibleLines = [...STATIC_LINES, ...displayLines]
  const isStretching = failurePhase === 'stretch' || failurePhase === 'corrupt'
  const isCorrupting = failurePhase === 'corrupt'
  const textIntensity = isCorrupting ? 0.56 : isStretching ? 0.19 : 0

  const renderLine = (line: string, index: number) => {
    if (!isStretching) return line

    const seed = corruptFrame * 13 + index * 29
    const readableFlash = isCorrupting && (corruptFrame + index) % 7 === 0
    const subtleHold = !isCorrupting && (corruptFrame + index) % 4 !== 0

    if (readableFlash || subtleHold) return line
    return collapseLine(line, seed, textIntensity + (index % 3) * 0.035)
  }

  return (
    <div
      className={`error-screen error-screen--${failurePhase}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0000FF',
        color: '#FFFFFF',
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 'clamp(10px, 1.4vw, 14px)',
        lineHeight: 1.65,
        padding: 'clamp(20px, 5vh, 60px) clamp(16px, 6vw, 80px)',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      <style>{`
        .error-screen {
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.45);
          isolation: isolate;
        }

        .error-screen::before,
        .error-screen::after {
          position: fixed;
          inset: 0;
          z-index: 2;
          content: '';
          pointer-events: none;
          opacity: 0;
        }

        .error-screen::before {
          background:
            repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.18) 0,
              rgba(255, 255, 255, 0.18) 1px,
              transparent 1px,
              transparent 5px
            ),
            linear-gradient(
              90deg,
              transparent 0 14%,
              rgba(0, 255, 255, 0.18) 14% 14.7%,
              transparent 14.7% 48%,
              rgba(255, 0, 64, 0.2) 48% 49%,
              transparent 49% 72%,
              rgba(255, 255, 255, 0.16) 72% 72.5%,
              transparent 72.5% 100%
            );
          mix-blend-mode: screen;
        }

        .error-screen::after {
          background:
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.08) 0 1%,
              transparent 1% 9%,
              rgba(0, 38, 255, 0.88) 9% 13%,
              transparent 13% 23%,
              rgba(0, 0, 120, 0.64) 23% 27%,
              transparent 27% 36%,
              rgba(24, 206, 255, 0.18) 36% 39%,
              transparent 39% 48%,
              rgba(0, 0, 94, 0.72) 48% 52%,
              transparent 52% 61%,
              rgba(255, 255, 255, 0.11) 61% 63%,
              transparent 63% 72%,
              rgba(0, 21, 255, 0.76) 72% 77%,
              transparent 77% 86%,
              rgba(0, 0, 84, 0.8) 86% 90%,
              transparent 90% 100%
            );
          transform: translate3d(0, 0, 0);
        }

        .error-screen--stretch {
          animation: error-blue-breath 0.12s steps(2, end) infinite;
        }

        .error-screen--stretch::before {
          opacity: 0.22;
        }

        .error-screen--corrupt {
          animation: error-screen-corrupt 0.09s steps(2, end) infinite;
        }

        .error-screen--corrupt::before {
          opacity: 0.58;
          animation: error-scan-tear 0.16s steps(3, end) infinite;
        }

        .error-screen--corrupt::after {
          opacity: 0.82;
          animation: error-row-tear 0.18s steps(2, end) infinite;
        }

        .error-screen__content {
          position: relative;
          z-index: 1;
        }

        .error-screen__line {
          display: block;
          white-space: pre;
          transform-origin: 0 50%;
        }

        .error-screen--stretch .error-screen__line {
          animation: error-line-precollapse 0.18s steps(2, end) infinite;
        }

        .error-screen--corrupt .error-screen__line {
          animation: error-line-collapse 0.11s steps(2, end) infinite;
        }

        .error-screen--corrupt .error-screen__line:nth-child(3n + 1) {
          transform: translateX(-0.45em) scaleX(1.035);
        }

        .error-screen--corrupt .error-screen__line:nth-child(3n + 2) {
          transform: translateX(0.68em) scaleY(1.18);
        }

        .error-screen--corrupt .error-screen__line:nth-child(5n) {
          transform: translateX(-1.1em) scaleX(1.08) scaleY(0.86);
          filter: blur(0.35px);
        }

        .error-screen--corrupt .error-screen__content {
          animation: error-text-rgb 0.08s steps(2, end) infinite;
        }

        .error-screen__collapse {
          position: absolute;
          inset: 0;
          padding: inherit;
          z-index: 3;
          overflow: hidden;
          white-space: pre;
          pointer-events: none;
          opacity: 0;
          transform-origin: 50% 0;
          filter: blur(0.2px);
          text-shadow:
            2px 0 rgba(255, 0, 60, 0.7),
            -2px 0 rgba(0, 255, 255, 0.65),
            0 0 8px rgba(255, 255, 255, 0.55);
        }

        .error-screen__collapse::before,
        .error-screen__collapse::after {
          position: absolute;
          inset: 0;
          content: '';
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .error-screen__collapse::before {
          background:
            repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.11) 0,
              rgba(255, 255, 255, 0.11) 1px,
              transparent 1px,
              transparent 3px
            ),
            linear-gradient(
              90deg,
              rgba(255, 0, 40, 0.15),
              transparent 18%,
              rgba(0, 255, 255, 0.16) 41%,
              transparent 68%,
              rgba(255, 255, 255, 0.12)
            );
        }

        .error-screen__collapse::after {
          background:
            linear-gradient(to bottom, transparent 0 6%, rgba(255,255,255,0.18) 6% 7%, transparent 7% 18%),
            linear-gradient(to bottom, transparent 0 31%, rgba(0,0,0,0.34) 31% 35%, transparent 35% 56%),
            linear-gradient(to bottom, transparent 0 64%, rgba(255,255,255,0.12) 64% 67%, transparent 67% 100%);
          animation: error-framebuffer-slice 0.13s steps(2, end) infinite;
        }

        .error-screen--stretch .error-screen__collapse {
          opacity: 0.42;
          animation: error-collapse-grow 0.28s cubic-bezier(0.12, 0.88, 0.26, 1) forwards;
        }

        .error-screen--corrupt .error-screen__collapse {
          opacity: 1;
          animation: error-collapse-break 0.1s steps(2, end) infinite;
        }

        .error-screen__collapse-line {
          display: block;
          height: 1.18em;
          transform-origin: 0 0;
        }

        .error-screen__collapse-line:nth-child(3n + 1) {
          transform: translateX(-0.45em) scaleY(1.35);
        }

        .error-screen__collapse-line:nth-child(3n + 2) {
          transform: translateX(0.72em) scaleY(1.9);
        }

        .error-screen__collapse-line:nth-child(3n) {
          transform: translateX(0.18em) scaleY(2.55);
        }

        .error-screen__collapse-line:nth-child(5n) {
          transform: translateX(-1.2em) scaleY(3.1);
        }

        @keyframes error-blue-breath {
          0% { background-color: #0000ff; }
          50% { background-color: #001fff; }
          100% { background-color: #0000db; }
        }

        @keyframes error-screen-corrupt {
          0% {
            background-color: #0000ff;
            transform: translateX(0);
            filter: saturate(1.4) contrast(1.2);
          }
          35% {
            background-color: #0018df;
            transform: translateX(-6px);
            filter: saturate(2.1) contrast(1.45);
          }
          70% {
            background-color: #0700ff;
            transform: translateX(4px);
            filter: saturate(1.65) contrast(1.75);
          }
          100% {
            background-color: #0000a8;
            transform: translateX(0);
            filter: saturate(2.2) contrast(1.3);
          }
        }

        @keyframes error-collapse-grow {
          0% {
            clip-path: inset(0 0 86% 0);
            transform: translateY(-0.15em) scaleY(0.92);
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: translateY(0.24em) scaleY(1.18);
          }
        }

        @keyframes error-collapse-break {
          0% {
            clip-path: inset(0 0 0 0);
            transform: translate(-2px, 0.2em) scaleY(1.18) skewY(-0.4deg);
          }
          50% {
            clip-path: inset(2% 0 4% 0);
            transform: translate(10px, 0.5em) scaleY(1.58) skewY(0.7deg);
          }
          100% {
            clip-path: inset(0 0 1% 0);
            transform: translate(-7px, 0.1em) scaleY(1.34) skewY(-0.3deg);
          }
        }

        @keyframes error-line-precollapse {
          0% { transform: translateX(0); filter: none; }
          100% { transform: translateX(0.18em); filter: blur(0.12px); }
        }

        @keyframes error-line-collapse {
          0% { transform: translateX(-0.2em) scaleX(1.02); filter: blur(0.1px); }
          45% { transform: translateX(0.75em) scaleX(0.96) scaleY(1.08); filter: blur(0.42px); }
          100% { transform: translateX(-0.55em) scaleX(1.08) scaleY(0.92); filter: blur(0.18px); }
        }

        @keyframes error-text-rgb {
          0% {
            transform: translateX(0);
            text-shadow:
              3px 0 rgba(255, 0, 50, 0.74),
              -3px 0 rgba(0, 255, 255, 0.72),
              0 0 9px rgba(255, 255, 255, 0.55);
          }
          100% {
            transform: translateX(5px);
            text-shadow:
              -4px 0 rgba(255, 0, 50, 0.76),
              4px 0 rgba(0, 255, 255, 0.7),
              0 0 12px rgba(255, 255, 255, 0.72);
          }
        }

        @keyframes error-scan-tear {
          0% { transform: translateY(-1%); }
          40% { transform: translate(12px, 1%); }
          100% { transform: translate(-8px, 0); }
        }

        @keyframes error-row-tear {
          0% { transform: translateX(-10px) skewY(-1deg); }
          50% { transform: translateX(16px) skewY(0.6deg); }
          100% { transform: translateX(-4px) skewY(-0.4deg); }
        }

        @keyframes error-framebuffer-slice {
          0% { transform: translateY(-3%) scaleY(1.15); opacity: 0.68; }
          50% { transform: translate(18px, 2%) scaleY(1.45); opacity: 0.95; }
          100% { transform: translate(-11px, 0) scaleY(1.24); opacity: 0.76; }
        }
      `}</style>
      <div className="error-screen__content">
        {STATIC_LINES.map((line, i) => (
          <div key={i} className="error-screen__line">
            {renderLine(line, i)}
          </div>
        ))}
        {displayLines.map((line, i) => (
          <div key={`t-${i}`} className="error-screen__line">
            {renderLine(line, STATIC_LINES.length + i)}
            {i === displayLines.length - 1 && typedCount < TYPING_FULL.length && (
              <span style={{ opacity: cursorOn ? 1 : 0 }}>_</span>
            )}
          </div>
        ))}
      </div>
      {isStretching && (
        <div className="error-screen__collapse" aria-hidden="true">
          {allVisibleLines.map((line, index) => (
            <span key={`${line}-${index}`} className="error-screen__collapse-line">
              {isCorrupting
                ? repeatedSmear(line, corruptFrame * 19 + index + 17, 3, 0.5)
                : repeatedSmear(line, corruptFrame * 7 + index + 5, 1, 0.22)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
