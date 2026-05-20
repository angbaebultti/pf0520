import CRTMonitor from './CRTMonitor'
import '@styles/controlroom.css'

const monitors = [
  { channel: 'CH-01', title: 'PROJECT SLOT' },
  { channel: 'CH-02', title: 'PROJECT SLOT' },
  { channel: 'CH-03', title: 'PROJECT SLOT' },
  { channel: 'CH-04', title: 'PROJECT SLOT' },
  { channel: 'CH-05', title: 'PROJECT SLOT' },
  { channel: 'CH-06', title: 'PROJECT SLOT' },
  { channel: 'AUX-07', title: 'NOISE BUS', variant: 'static' as const },
  { channel: 'AUX-08', title: 'DATA BUS', variant: 'data' as const },
]

const coreButtons = ['01', '02', '03', '04', '05', '06', '07', '08']
const signalBlocks = Array.from({ length: 22 }, (_, index) => index)

export default function ControlRoom() {
  const handleMonitorSelect = (channel: string) => {
    console.info(`Control room channel selected: ${channel}`)
  }

  return (
    <section className="control-room" aria-label="Retro control room">
      <div className="control-room__inner">
        <div className="control-room__header" aria-hidden="true">
          <span>CORE ARRAY / MONITOR WALL</span>
          <span>STATUS: STABLE</span>
        </div>

        <div className="control-room__grid">
          {monitors.map(monitor => (
            <CRTMonitor
              key={monitor.channel}
              channel={monitor.channel}
              title={monitor.title}
              variant={monitor.variant}
              onSelect={handleMonitorSelect}
            />
          ))}
        </div>

        <div className="control-bar" aria-hidden="true">
          <div className="control-module control-module--core">
            <span className="control-module__title">CORE CONTROL</span>
            <div className="core-console">
              <div className="core-switches">
                {coreButtons.map(button => (
                  <span key={button} className="core-button">
                    {button}
                  </span>
                ))}
              </div>
              <div className="core-lamps">
                <span className="lamp lamp--red" />
                <span className="lamp lamp--amber" />
                <span className="lamp lamp--green" />
              </div>
            </div>
          </div>

          <div className="control-module control-module--channel">
            <span className="control-module__title">ACTIVE CHANNEL</span>
            <div className="channel-readout">
              <span>X-01&nbsp;&nbsp;Y-27&nbsp;&nbsp;Z-09</span>
              <span>SIGNAL LOCK</span>
              <div className="signal-lock">
                {signalBlocks.map(block => (
                  <span key={block} className={block > 18 ? 'signal-lock__peak' : ''} />
                ))}
              </div>
              <span>VECTOR ALIGNMENT: 97%</span>
            </div>
          </div>

          <div className="control-module control-module--freq">
            <span className="control-module__title">FREQ ADJUST</span>
            <div className="faders">
              {[72, 48, 64, 38].map((value, index) => (
                <span key={`${value}-${index}`} className="fader">
                  <span className="fader__track" />
                  <span className="fader__thumb" style={{ bottom: `${value}%` }} />
                </span>
              ))}
            </div>
          </div>

          <div className="control-module control-module--override">
            <span className="control-module__title">SYSTEM OVERRIDE</span>
            <div className="override-toggle">
              <span />
            </div>
            <span className="override-label">ARMED</span>
          </div>

          <div className="control-module control-module--master">
            <span className="control-module__title">MASTER CONTROL</span>
            <div className="master-knob">
              <span />
            </div>
            <div className="master-scale" />
          </div>
        </div>
      </div>
    </section>
  )
}
