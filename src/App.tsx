import IntroSequence from '@components/intro/IntroSequence'
import ControlRoom from '@components/ControlRoom'
import GlobalHudCursor from '@components/GlobalHudCursor'

function App() {
  return (
    <div className="app-shell">
      <IntroSequence />
      <ControlRoom />
      <GlobalHudCursor />
    </div>
  )
}

export default App
