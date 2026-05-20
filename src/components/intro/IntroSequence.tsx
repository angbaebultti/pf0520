import { useState } from 'react'
import ErrorScreen from './ErrorScreen'
import BrokenLCD from './BrokenLCD'
import SpaceScene from './SpaceScene'
import SignalContamination from './SignalContamination'

type Phase = 'error' | 'lcd' | 'space'

export default function IntroSequence() {
  const [phase, setPhase] = useState<Phase>('error')
  const [showSpace, setShowSpace] = useState(false)
  const [lcdRevealingSpace, setLcdRevealingSpace] = useState(false)

  const startLcd = () => {
    setPhase('lcd')
    setShowSpace(false)
    setLcdRevealingSpace(false)
  }

  const revealSpace = () => {
    setShowSpace(true)
    setLcdRevealingSpace(true)
  }

  const finishLcd = () => {
    setPhase('space')
    setShowSpace(true)
    setLcdRevealingSpace(false)
  }

  const signalMode = phase === 'space' || showSpace ? 'space' : phase

  return (
    <>
      {(phase === 'space' || showSpace) && <SpaceScene isEmerging={lcdRevealingSpace} />}
      {phase === 'error' && <ErrorScreen onComplete={startLcd} />}
      {phase === 'lcd' && (
        <BrokenLCD
          onComplete={finishLcd}
          onRevealSpace={revealSpace}
          isRevealingSpace={lcdRevealingSpace}
        />
      )}
      <SignalContamination mode={signalMode} lcdRevealingSpace={lcdRevealingSpace} />
    </>
  )
}
