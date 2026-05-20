import { useEffect, useRef, useState, type FC } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// ── tunnel dimensions ──────────────────────────────────────────────────────
const W = 8          // tunnel width  (x: -4 → +4)
const H = 6          // tunnel height (y: -3 → +3)
const L = 80         // tunnel length (z:  0 → -80)

// ── grid: each cell is CELL × CELL in world units → perfectly square ───────
const CELL = 1                         // 1 world unit per cell side
const COLS = Math.round(W / CELL)      // 8  columns across floor/ceiling
const ROWS = Math.round(H / CELL)      // 6  rows across walls
const DEPTH = Math.round(L / CELL)     // 80 depth steps (z-axis)

const SAGE = 0x5b8e53
const CAM_Z_MIN = -(L - 1)
const CAM_Z_MAX = 0
const WEBGL_MIN_WIDTH = 700

// ── grid geometry builders ─────────────────────────────────────────────────
// Horizontal face (floor / ceiling) at a fixed y.
// Lines are axis-aligned: no diagonals, no triangle artefacts.
function buildHGrid(y: number): THREE.BufferGeometry {
  const xMin = -W / 2
  const xMax = W / 2
  // (COLS+1) depth lines (run along Z) + (DEPTH+1) cross lines (run along X)
  const segs = (COLS + 1) + (DEPTH + 1)
  const pos = new Float32Array(segs * 2 * 3)
  let i = 0

  // Depth lines — parallel to Z, spaced every CELL units across X
  for (let c = 0; c <= COLS; c++) {
    const x = xMin + c * CELL
    pos[i++] = x;    pos[i++] = y; pos[i++] = 0
    pos[i++] = x;    pos[i++] = y; pos[i++] = -L
  }

  // Cross lines — parallel to X, spaced every CELL units along Z
  for (let d = 0; d <= DEPTH; d++) {
    const z = -d * CELL
    pos[i++] = xMin; pos[i++] = y; pos[i++] = z
    pos[i++] = xMax; pos[i++] = y; pos[i++] = z
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return geo
}

// Vertical face (left / right wall) at a fixed x.
function buildVGrid(x: number): THREE.BufferGeometry {
  const yMin = -H / 2
  const yMax = H / 2
  // (ROWS+1) depth lines (run along Z) + (DEPTH+1) cross lines (run along Y)
  const segs = (ROWS + 1) + (DEPTH + 1)
  const pos = new Float32Array(segs * 2 * 3)
  let i = 0

  // Depth lines — parallel to Z, spaced every CELL units across Y
  for (let r = 0; r <= ROWS; r++) {
    const y = yMin + r * CELL
    pos[i++] = x; pos[i++] = y;    pos[i++] = 0
    pos[i++] = x; pos[i++] = y;    pos[i++] = -L
  }

  // Cross lines — parallel to Y, spaced every CELL units along Z
  for (let d = 0; d <= DEPTH; d++) {
    const z = -d * CELL
    pos[i++] = x; pos[i++] = yMin; pos[i++] = z
    pos[i++] = x; pos[i++] = yMax; pos[i++] = z
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return geo
}

// ── webgl detection ────────────────────────────────────────────────────────
function canUseWebGL() {
  if (typeof window === 'undefined') return false
  if (window.innerWidth < WEBGL_MIN_WIDTH) return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!ctx) return false
  ;(ctx as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  return true
}

function TunnelFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          background:
            'repeating-linear-gradient(90deg,rgba(91,142,83,0.2) 0,rgba(91,142,83,0.2) 1px,transparent 1px,transparent 40px),' +
            'repeating-linear-gradient(0deg,rgba(91,142,83,0.15) 0,rgba(91,142,83,0.15) 1px,transparent 1px,transparent 40px)',
          opacity: 0.7,
          transform: 'perspective(600px) rotateX(60deg) translateY(20vh)',
          transformOrigin: '50% 100%',
        }}
      />
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────
const GlassTunnel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglFailed, setWebglFailed] = useState(() => !canUseWebGL())

  useEffect(() => {
    const onContextError = (e: Event) => {
      e.preventDefault()
      setWebglFailed(true)
    }
    const onResize = () => {
      if (window.innerWidth < WEBGL_MIN_WIDTH) setWebglFailed(true)
    }
    window.addEventListener('webglcontextcreationerror', onContextError)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('webglcontextcreationerror', onContextError)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (webglFailed) return
    const canvas = canvasRef.current
    if (!canvas) return

    // ── renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    renderer.setClearColor(0x000000)

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      setWebglFailed(true)
    }, { once: true })

    // ── scene (no fog) ───────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // ── camera – fov 60, centred at y=0 ─────────────────────────────────
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 0)

    // ── line materials ───────────────────────────────────────────────────
    // Primary line: sharp, clearly visible
    const matLine = new THREE.LineBasicMaterial({
      color: SAGE,
      transparent: true,
      opacity: 0.85,
    })
    // Glow layer: same colour, additive blending → neon halo around lines
    const matGlow = new THREE.LineBasicMaterial({
      color: SAGE,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // ── build grid faces ─────────────────────────────────────────────────
    const floorGeo = buildHGrid(-H / 2)
    const ceilGeo  = buildHGrid(+H / 2)
    const leftGeo  = buildVGrid(-W / 2)
    const rightGeo = buildVGrid(+W / 2)

    const addFace = (geo: THREE.BufferGeometry) => {
      const main = new THREE.LineSegments(geo, matLine)
      main.frustumCulled = false
      scene.add(main)
      const glow = new THREE.LineSegments(geo, matGlow)
      glow.frustumCulled = false
      scene.add(glow)
    }

    addFace(floorGeo)
    addFace(ceilGeo)
    addFace(leftGeo)
    addFace(rightGeo)

    // ── soft point light ahead of camera ────────────────────────────────
    const pointLight = new THREE.PointLight(SAGE, 2.5, 20)
    scene.add(pointLight)

    // ── bloom post-processing ────────────────────────────────────────────
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4,   // strength
      0.6,   // radius
      0.3,   // threshold
    ))

    // ── wheel-driven camera Z ────────────────────────────────────────────
    let targetZ = 0
    let currentZ = 0

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetZ = THREE.MathUtils.clamp(targetZ + e.deltaY * 0.05, CAM_Z_MIN, CAM_Z_MAX)
    }
    window.addEventListener('wheel', onWheel, { passive: false })

    // ── resize ───────────────────────────────────────────────────────────
    const onResizeGL = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResizeGL)

    // ── animation loop ───────────────────────────────────────────────────
    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)

      // smooth camera Z (lerp factor 0.08)
      currentZ += (targetZ - currentZ) * 0.08
      camera.position.set(0, 0, currentZ)
      pointLight.position.set(0, 0, currentZ - 8)

      // drive --control-room-opacity from tunnel progress
      const progress = (-currentZ) / (L - 1)
      const eased = progress * progress * (3 - 2 * progress)
      const opacity = Math.max(0, Math.min(1, (eased - 0.9) / 0.1))
      document.documentElement.style.setProperty('--control-room-opacity', String(opacity))

      composer.render()
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResizeGL)
      document.documentElement.style.setProperty('--control-room-opacity', '0')
      matLine.dispose()
      matGlow.dispose()
      floorGeo.dispose()
      ceilGeo.dispose()
      leftGeo.dispose()
      rightGeo.dispose()
      composer.dispose()
      renderer.dispose()
    }
  }, [webglFailed])

  return (
    <>
      {webglFailed ? (
        <TunnelFallback />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            background: '#000',
          }}
        />
      )}
    </>
  )
}

export default GlassTunnel
