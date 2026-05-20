interface CRTMonitorProps {
  channel: string
  title?: string
  variant?: 'placeholder' | 'static' | 'data'
  onSelect?: (channel: string) => void
}

const dataRows = ['01001011', '11010010', '00110100', '10101101', '01100110', '10010011']

export default function CRTMonitor({
  channel,
  title = 'STANDBY',
  variant = 'placeholder',
  onSelect,
}: CRTMonitorProps) {
  const isPlaceholder = variant === 'placeholder'

  return (
    <button
      className={`crt-monitor crt-monitor--${variant}`}
      type="button"
      onClick={() => onSelect?.(channel)}
      aria-label={`${channel} monitor`}
    >
      <span className="crt-monitor__label">{channel}</span>
      <span className="crt-monitor__status">{title}</span>
      <span className="crt-monitor__screen" aria-hidden="true">
        {isPlaceholder && (
          <span className="crt-monitor__placeholder">
            <span>PROJECT LINK</span>
            <span>AWAITING INPUT</span>
            <span className="crt-monitor__cursor">_</span>
          </span>
        )}
        {variant === 'static' && <span className="crt-monitor__static" />}
        {variant === 'data' && (
          <span className="crt-monitor__data">
            {dataRows.map((row, index) => (
              <span key={`${row}-${index}`}>{row}</span>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}
