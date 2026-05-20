import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import RetroRoom from './RetroRoom'
import CloudCluster from './CloudCluster'

const CAMERA_START_Z = 8
const CAMERA_Y = 7
const LOOK_AHEAD_Z = 34
const ROOM_BACK_Z = -200
const LOOK_TARGET_MIN_Z = ROOM_BACK_Z + 7
const CAMERA_TRAVEL_Z = 60

function SceneSetup() {
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x080008, 0.00018)

    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene])

  return null
}

function StarField({ scrollProgressRef }: { scrollProgressRef: MutableRefObject<number> }) {
  const { geometry, basePositions } = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80 + 7
      positions[i * 3 + 2] = -35 - Math.random() * 220
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return {
      geometry: geo,
      basePositions: positions.slice(),
    }
  }, [])

  useFrame(() => {
    const progress = scrollProgressRef.current
    const rush = 1 + progress * 2
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute

    const positions = positionAttribute.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      const zIndex = i * 3 + 2
      positions[zIndex] = basePositions[zIndex] * rush
    }
    positionAttribute.needsUpdate = true
  })

  return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial color={0xfff0fb} size={0.16} sizeAttenuation transparent opacity={0.82} />
      </points>
      <points geometry={geometry}>
        <pointsMaterial
          color={0x66e8ff}
          size={0.34}
          sizeAttenuation
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

function CameraRig({ scrollProgressRef }: { scrollProgressRef: MutableRefObject<number> }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, CAMERA_Y, CAMERA_START_Z)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, CAMERA_Y, CAMERA_START_Z - LOOK_AHEAD_Z)
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame(() => {
    const scrollY = window.scrollY
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    const progress = Math.min(scrollY / maxScroll, 1)
    const smooth = progress * progress * (3 - 2 * progress)
    const cameraZ = CAMERA_START_Z - smooth * CAMERA_TRAVEL_Z
    const targetZ = Math.max(cameraZ - LOOK_AHEAD_Z, LOOK_TARGET_MIN_Z)
    const controlRoomOpacity = THREE.MathUtils.clamp((progress - 0.95) / 0.05, 0, 1)

    scrollProgressRef.current = smooth
    document.documentElement.style.setProperty('--control-room-opacity', String(controlRoomOpacity))

    const perspectiveCamera = camera as THREE.PerspectiveCamera
    camera.position.set(0, CAMERA_Y, cameraZ)
    camera.lookAt(0, CAMERA_Y, targetZ)
      perspectiveCamera.fov = 60 + smooth * 60
    perspectiveCamera.updateProjectionMatrix()
    console.log('camera.position.z', camera.position.z, 'scrollProgress', progress)
  })

  return null
}

function ScrollDebugReadout() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let frameId = 0

    const updateScrollY = () => {
      setScrollY(window.scrollY)
      frameId = requestAnimationFrame(updateScrollY)
    }

    updateScrollY()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 13,
        pointerEvents: 'none',
      }}
    >
      scroll: {Math.round(scrollY)}px
    </div>
  )
}

interface SceneCanvasProps {
  isEmerging?: boolean
}

export default function SceneCanvas({ isEmerging = false }: SceneCanvasProps) {
  const scrollProgressRef = useRef(0)
  const sceneClassName = ['scene-shell', isEmerging ? 'scene-shell--emerging' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <Canvas
        camera={{ position: [0, 7, CAMERA_START_Z], fov: 60, near: 0.1, far: 1000 }}
        className={sceneClassName}
        frameloop="always"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <SceneSetup />
        <CameraRig scrollProgressRef={scrollProgressRef} />
        <StarField scrollProgressRef={scrollProgressRef} />
        <RetroRoom scrollProgressRef={scrollProgressRef} />
        <CloudCluster scrollProgressRef={scrollProgressRef} />
      </Canvas>
      <div className="void-depth-mask" aria-hidden="true" />
      <div className="crt-atmosphere" aria-hidden="true" />
      <ScrollDebugReadout />
      <div className="vhs-monitor-frame" aria-hidden="true">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
        <div className="monitor-readout readout-left">
          <span>SYS-01</span>
          <span>88:00:00</span>
          <span>GRID MODE: ACTIVE</span>
        </div>
        <div className="monitor-readout readout-right">
          <span>MEMORY CORE</span>
          <span>246B / 55536</span>
          <span>STATUS: STABLE</span>
        </div>
        <div className="terminal-strip" />
      </div>
      <div className="scroll-track" style={{ height: '600vh', pointerEvents: 'none' }} />
    </>
  )
}
