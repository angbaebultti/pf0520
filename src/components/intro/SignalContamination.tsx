type SignalMode = 'error' | 'lcd' | 'space'

interface Props {
  mode: SignalMode
  lcdRevealingSpace?: boolean
}

const GHOST_LINES = [
  '404 E// PAGE NOT FOUND',
  'TRACE 009F CACHE FLUSHED',
  'PAGE CORRUPTED',
  'TRY RETRY // FAILED',
  'SYSTEM HALT...',
]

export default function SignalContamination({ mode, lcdRevealingSpace = false }: Props) {
  const className = [
    'signal-contamination',
    `signal-contamination--${mode}`,
    lcdRevealingSpace ? 'signal-contamination--revealing-space' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} aria-hidden="true">
      <div className="signal-contamination__ghost-text">
        {GHOST_LINES.map((line, index) => (
          <span key={index}>{line}</span>
        ))}
      </div>
      <div className="signal-contamination__tear signal-contamination__tear--a" />
      <div className="signal-contamination__tear signal-contamination__tear--b" />
      <div className="signal-contamination__tear signal-contamination__tear--c" />
    </div>
  )
}
