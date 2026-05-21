import { useEffect, useState } from 'react'
import '@styles/controlroom.css'

const telemetryLines = ['LOADING...', 'CONNECTING TO DSL DATABASE...', 'PRELOADING SOLUTIONS...', 'DISPLAYING DSL SOLUTIONS']
const mePhotoSrc = '/src/assets/me.png'
const tvPanels = ['me', 'signal-a', 'signal-b', 'signal-c', 'signal-d', 'signal-e']

export default function ControlRoom() {
  const [isTitleHidden, setIsTitleHidden] = useState(false)

  useEffect(() => {
    let animationId = 0
    let hideTimer = 0
    let hasQueuedHide = false

    const watchRoomOpacity = () => {
      const opacity = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-room-opacity')) || 0

      if (opacity >= 0.85 && !hasQueuedHide) {
        hasQueuedHide = true
        hideTimer = window.setTimeout(() => setIsTitleHidden(true), 2600)
      }

      if (opacity < 0.2) {
        hasQueuedHide = false
        setIsTitleHidden(false)
        window.clearTimeout(hideTimer)
      }

      animationId = requestAnimationFrame(watchRoomOpacity)
    }

    animationId = requestAnimationFrame(watchRoomOpacity)

    return () => {
      cancelAnimationFrame(animationId)
      window.clearTimeout(hideTimer)
    }
  }, [])

  return (
    <section className={`control-room${isTitleHidden ? ' control-room--title-hidden' : ''}`} aria-label="Dark Star Labs control room">
      <div className="control-room__stars" aria-hidden="true" />
      <nav className="control-room__nav" aria-label="Control room navigation">
        <span className="control-room__brand">DSL<span>.</span></span>
        <a href="#home">HOME</a>
        <button type="button" aria-label="Open menu">+</button>
      </nav>

      <div className="cockpit" aria-hidden="true">
        <div className="cockpit__ceiling" />
        <div className="cockpit__window-belt">
          <div className="cockpit__window-track">
            {[...tvPanels, ...tvPanels].map((panel, index) => (
              <div className="cockpit__window" key={`${panel}-${index}`}>
                {panel === 'me' && <img src={mePhotoSrc} alt="" />}
              </div>
            ))}
          </div>
        </div>
        <div className="cockpit__console cockpit__console--left" />
        <div className="cockpit__console cockpit__console--center">
          <span>DARK</span>
          <span>STAR</span>
          <span>LABS</span>
        </div>
        <div className="cockpit__console cockpit__console--right" />
        <div className="cockpit__seat cockpit__seat--left" />
        <div className="cockpit__seat cockpit__seat--right" />
      </div>

      <h1 className="control-room__title">
        <span>JUHEE HONG</span>
      </h1>

      <div className="control-room__terminal" aria-hidden="true">
        {telemetryLines.map((line) => (
          <span key={line}>&gt; {line}</span>
        ))}
      </div>
    </section>
  )
}
