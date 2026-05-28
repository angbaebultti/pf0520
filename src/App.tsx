import { useState } from 'react'
import IntroSequence from '@components/intro/IntroSequence'
import ControlRoom from '@components/ControlRoom'
import GlobalHudCursor from '@components/GlobalHudCursor'

function App() {
  const [hasEnteredTunnel, setHasEnteredTunnel] = useState(false)

  return (
    <div className={`app-shell${hasEnteredTunnel ? ' app-shell--hud-cursor' : ''}`}>
      <IntroSequence onTunnelStart={() => setHasEnteredTunnel(true)} />
      {hasEnteredTunnel && <ControlRoom />}
      {hasEnteredTunnel && <GlobalHudCursor />}
    </div>
  )
}

export default App
