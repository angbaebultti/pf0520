import '@styles/controlroom.css'
import character06Src from '@assets/charcter06.png'

export default function ControlRoom() {
  return (
    <section className="control-room" aria-label="Dark Star Labs main visual">
      <header className="control-room__header">
        {/* <nav className="control-room__nav" aria-label="Main navigation">
          <a href="#home" aria-current="page">KR</a>
          <a href="#home">EN</a>
          <button type="button">LIST</button>
        </nav> */}
      </header>

      <div className="control-room__hero" aria-hidden="true">
        <img className="control-room__backdrop" src={character06Src} alt="" />
        <img className="control-room__character" src={character06Src} alt="" />
      </div>

      <div className="control-room__intro">
        <p>UIUX DESIGNER</p>
        <h1>JUHEE HONG</h1>
      </div>
    </section>
  )
}
