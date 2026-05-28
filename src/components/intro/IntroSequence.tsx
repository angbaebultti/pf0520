import { useCallback, useEffect, useState } from 'react'
import ErrorScreen from './ErrorScreen'
import GlassTunnel from './GlassTunnel'

type Phase = 'error' | 'tunnel'

type IntroSequenceProps = {
  onTunnelStart?: () => void
}

export default function IntroSequence({ onTunnelStart }: IntroSequenceProps) {
  const [phase, setPhase] = useState<Phase>('error')

  useEffect(() => {
    document.documentElement.style.setProperty('--control-room-opacity', '0')
  }, [])

  const goToTunnel = useCallback(() => {
    onTunnelStart?.()
    setPhase('tunnel')
  }, [onTunnelStart])

  return (
    <>
      {phase === 'tunnel' && <GlassTunnel />}
      {phase === 'error' && (
        <>
          <ErrorScreen durationMs={1200} breakDurationMs={1200} onComplete={goToTunnel} />
          <button className="intro-skip-button" type="button" onClick={goToTunnel} aria-label="Skip intro" data-hud-click="true">
            SKIP
          </button>
        </>
      )}
    </>
  )
}
