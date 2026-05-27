import { useCallback, useEffect, useState } from 'react'
import ErrorScreen from './ErrorScreen'
import GlassTunnel from './GlassTunnel'

type Phase = 'error' | 'tunnel'

export default function IntroSequence() {
  const [phase, setPhase] = useState<Phase>('error')

  useEffect(() => {
    document.documentElement.style.setProperty('--control-room-opacity', '0')
  }, [])

  const goToTunnel = useCallback(() => {
    setPhase('tunnel')
  }, [])

  return (
    <>
      <GlassTunnel />
      {phase === 'error' && (
        <>
          <ErrorScreen durationMs={3000} breakDurationMs={3000} onComplete={goToTunnel} />
          <button className="intro-skip-button" type="button" onClick={goToTunnel} aria-label="Skip intro" data-hud-click="true">
            SKIP
          </button>
        </>
      )}
    </>
  )
}
