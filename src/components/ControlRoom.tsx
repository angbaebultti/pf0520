import '@styles/controlroom.css'

const telemetryLines = ['LOADING...', 'CONNECTING TO DSL DATABASE...', 'PRELOADING SOLUTIONS...', 'DISPLAYING DSL SOLUTIONS']

export default function ControlRoom() {
  return (
    <section className="control-room" aria-label="Dark Star Labs control room">
      <div className="control-room__stars" aria-hidden="true" />
      <nav className="control-room__nav" aria-label="Control room navigation">
        <span className="control-room__brand">DSL<span>.</span></span>
        <a href="#home">HOME</a>
        <button type="button" aria-label="Open menu">+</button>
      </nav>

      <div className="cockpit" aria-hidden="true">
        <div className="cockpit__ceiling" />
        <div className="cockpit__window cockpit__window--left" />
        <div className="cockpit__window cockpit__window--center" />
        <div className="cockpit__window cockpit__window--right" />
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
        <span>OUR VISION</span>
      </h1>

      <div className="control-room__terminal" aria-hidden="true">
        {telemetryLines.map((line) => (
          <span key={line}>&gt; {line}</span>
        ))}
      </div>
    </section>
  )
}
