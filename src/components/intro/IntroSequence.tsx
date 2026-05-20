import { useEffect, useState } from 'react'
import ErrorScreen from './ErrorScreen'
import GlassTunnel from './GlassTunnel'

type Phase = 'error' | 'tunnel'

export default function IntroSequence() {
  const [phase, setPhase] = useState<Phase>('error')

  useEffect(() => {
    document.documentElement.style.setProperty('--control-room-opacity', '0')
  }, [])

  return (
    <>
      {phase === 'error' && (
        <ErrorScreen durationMs={3000} breakDurationMs={760} onComplete={() => setPhase('tunnel')} />
      )}
      {phase === 'tunnel' && <GlassTunnel />}
    </>
  )
}
