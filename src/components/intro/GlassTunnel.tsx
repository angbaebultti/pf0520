import { Component, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { FilmShader } from 'three/examples/jsm/shaders/FilmShader.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'

const CAMERA_START_Z = 12
const AUTO_SPEED = 2.35
const SCROLL_SPEED = 9.5
const TUNNEL_LENGTH = 220
const RING_COUNT = 74
const RING_SEGMENTS = 24
const STRAND_COUNT = 220
const PANEL_COUNT = 90
const DEBRIS_COUNT = 180
const FIGURE_COUNT = 5
const TOXIC_GREEN = 0x49ff37
const DARK_GREEN = 0x061f08
const CYAN_GHOST = 0x55fff2
const WEBGL_MIN_WIDTH = 700

type FloatingItem = {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  drift: THREE.Vector3
  rotationSpeed: THREE.Vector3
  phase: number
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; onCrash: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onCrash()
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

function canUseWebGL() {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.innerWidth < WEBGL_MIN_WIDTH) {
    return false
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')

  if (!context) {
    return false
  }

  const gl = context as WebGLRenderingContext | WebGL2RenderingContext
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return true
}

function tunnelRadius(zIndex: number, time: number) {
  const t = zIndex * 0.21 + time * 0.28
  return {
    x: 6.2 + Math.sin(t) * 1.35 + Math.sin(t * 0.41) * 1.1,
    y: 4.1 + Math.cos(t * 0.73) * 0.95 + Math.sin(t * 0.31) * 0.55,
  }
}

function warpedRingPoint(segment: number, ring: number, time: number) {
  const angle = (segment / RING_SEGMENTS) * Math.PI * 2
  const radius = tunnelRadius(ring, time)
  const squareBlend = 0.72 + Math.sin(ring * 0.29 + time * 0.5) * 0.16
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const squareX = Math.sign(cos) * Math.pow(Math.abs(cos), squareBlend)
  const squareY = Math.sign(sin) * Math.pow(Math.abs(sin), squareBlend)
  const noise = Math.sin(ring * 1.7 + segment * 2.3 + time * 1.4) * 0.18

  return new THREE.Vector3(
    squareX * (radius.x + noise),
    squareY * (radius.y - noise * 0.7),
    -ring * (TUNNEL_LENGTH / (RING_COUNT - 1)),
  )
}

function makeFloatingItem(depthOffset = 0): FloatingItem {
  const side = Math.random() < 0.5 ? -1 : 1

  return {
    position: new THREE.Vector3(
      side * THREE.MathUtils.randFloat(2.4, 9.5) + THREE.MathUtils.randFloatSpread(1.2),
      THREE.MathUtils.randFloat(-4.6, 5.4),
      -THREE.MathUtils.randFloat(18, TUNNEL_LENGTH) - depthOffset,
    ),
    rotation: new THREE.Euler(
      THREE.MathUtils.randFloatSpread(Math.PI),
      THREE.MathUtils.randFloatSpread(Math.PI),
      THREE.MathUtils.randFloatSpread(Math.PI),
    ),
    scale: new THREE.Vector3(
      THREE.MathUtils.randFloat(0.45, 2.4),
      THREE.MathUtils.randFloat(0.35, 2.2),
      THREE.MathUtils.randFloat(0.22, 1.4),
    ),
    drift: new THREE.Vector3(
      THREE.MathUtils.randFloat(0.08, 0.4),
      THREE.MathUtils.randFloat(0.08, 0.36),
      THREE.MathUtils.randFloat(0.02, 0.12),
    ),
    rotationSpeed: new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(0.18),
      THREE.MathUtils.randFloatSpread(0.2),
      THREE.MathUtils.randFloatSpread(0.16),
    ),
    phase: Math.random() * Math.PI * 2,
  }
}

function recycleFloatingItem(item: FloatingItem, cameraZ: number) {
  const fresh = makeFloatingItem(TUNNEL_LENGTH * 0.25)
  item.position.copy(fresh.position)
  item.position.z += cameraZ - TUNNEL_LENGTH * 0.65
  item.rotation.copy(fresh.rotation)
  item.scale.copy(fresh.scale)
}

function applyFloatingMatrix(item: FloatingItem, object: THREE.Object3D, elapsed: number) {
  object.position.set(
    item.position.x + Math.sin(elapsed * 0.38 + item.phase) * item.drift.x,
    item.position.y + Math.cos(elapsed * 0.31 + item.phase) * item.drift.y,
    item.position.z + Math.sin(elapsed * 0.19 + item.phase) * item.drift.z,
  )
  object.rotation.set(
    item.rotation.x + elapsed * item.rotationSpeed.x,
    item.rotation.y + elapsed * item.rotationSpeed.y,
    item.rotation.z + elapsed * item.rotationSpeed.z,
  )
  object.scale.copy(item.scale)
  object.updateMatrix()
}

function SceneSetup() {
  const { gl, scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x000000, 0.034)
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.05
    gl.outputColorSpace = THREE.SRGBColorSpace

    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [gl, scene])

  return null
}

function CameraRig({ scrollTrackRef }: { scrollTrackRef: React.RefObject<HTMLDivElement> }) {
  const { camera } = useThree()
  const mouse = useRef(new THREE.Vector2())
  const smoothMouse = useRef(new THREE.Vector2())
  const scrollProgress = useRef(0)
  const shake = useRef(new THREE.Vector3())

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouse.current.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }

    camera.position.set(0, 0.15, CAMERA_START_Z)
    camera.lookAt(0, 0, -18)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.style.setProperty('--control-room-opacity', '0')
    }
  }, [camera])

  useFrame(({ clock }, delta) => {
    const scrollTrack = scrollTrackRef.current
    const scrollRange = Math.max((scrollTrack?.offsetHeight ?? window.innerHeight * 6) - window.innerHeight, 1)
    const targetScroll = THREE.MathUtils.clamp(window.scrollY / scrollRange, 0, 1)
    scrollProgress.current = THREE.MathUtils.lerp(scrollProgress.current, targetScroll, 0.065)
    const easedScroll = scrollProgress.current * scrollProgress.current * (3 - 2 * scrollProgress.current)
    const controlRoomOpacity = THREE.MathUtils.clamp((easedScroll - 0.9) / 0.1, 0, 1)

    document.documentElement.style.setProperty('--control-room-opacity', String(controlRoomOpacity))
    smoothMouse.current.lerp(mouse.current, 0.032)
    shake.current.set(
      Math.sin(clock.elapsedTime * 1.7) * 0.025 + Math.sin(clock.elapsedTime * 9.1) * 0.006,
      Math.cos(clock.elapsedTime * 1.2) * 0.022 + Math.sin(clock.elapsedTime * 7.7) * 0.006,
      0,
    )

    camera.position.z -= (AUTO_SPEED + easedScroll * SCROLL_SPEED) * delta
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, smoothMouse.current.x * 1.15 + shake.current.x, 0.038)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -smoothMouse.current.y * 0.62 + shake.current.y, 0.038)
    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      -smoothMouse.current.x * 0.025 + Math.sin(clock.elapsedTime * 0.55) * 0.012,
      0.04,
    )
    camera.lookAt(
      smoothMouse.current.x * 0.7 + Math.sin(clock.elapsedTime * 0.33) * 0.45,
      -smoothMouse.current.y * 0.42 + Math.cos(clock.elapsedTime * 0.29) * 0.26,
      camera.position.z - 22,
    )
  })

  return null
}

function PostProcessing() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const filmPassRef = useRef<ShaderPass | null>(null)
  const rgbPassRef = useRef<ShaderPass | null>(null)

  useEffect(() => {
    const composer = new EffectComposer(gl)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.95, 0.82, 0.12)
    const afterimagePass = new AfterimagePass(0.82)
    const rgbPass = new ShaderPass(RGBShiftShader)
    const vignettePass = new ShaderPass(VignetteShader)
    const filmPass = new ShaderPass(FilmShader)

    rgbPass.uniforms.amount.value = 0.0028
    vignettePass.uniforms.offset.value = 1.12
    vignettePass.uniforms.darkness.value = 1.18
    filmPass.uniforms.intensity.value = 0.12
    filmPass.uniforms.grayscale.value = false

    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(afterimagePass)
    composer.addPass(bloomPass)
    composer.addPass(rgbPass)
    composer.addPass(vignettePass)
    composer.addPass(filmPass)
    composerRef.current = composer
    filmPassRef.current = filmPass
    rgbPassRef.current = rgbPass

    return () => {
      composer.dispose()
      composerRef.current = null
    }
  }, [camera, gl, scene, size.height, size.width])

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size])

  useFrame(({ clock }, delta) => {
    if (filmPassRef.current) {
      filmPassRef.current.uniforms.time.value = clock.elapsedTime
    }

    if (rgbPassRef.current) {
      rgbPassRef.current.uniforms.angle.value = Math.sin(clock.elapsedTime * 0.47) * 0.6
      rgbPassRef.current.uniforms.amount.value = 0.002 + Math.abs(Math.sin(clock.elapsedTime * 0.9)) * 0.0013
    }

    composerRef.current?.render(delta)
  }, 1)

  return null
}

function WarpedWireTunnel() {
  const geometry = useMemo(() => {
    const ringEdges = RING_COUNT * RING_SEGMENTS * 2
    const lengthEdges = (RING_COUNT - 1) * RING_SEGMENTS * 2
    const positions = new Float32Array((ringEdges + lengthEdges) * 3)
    const tunnelGeometry = new THREE.BufferGeometry()
    tunnelGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return tunnelGeometry
  }, [])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: TOXIC_GREEN,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useFrame(({ camera, clock }) => {
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
    const positions = positionAttribute.array as Float32Array
    const cameraModulo = THREE.MathUtils.euclideanModulo(-camera.position.z, TUNNEL_LENGTH / (RING_COUNT - 1))
    const points: THREE.Vector3[][] = []
    let cursor = 0

    for (let ring = 0; ring < RING_COUNT; ring += 1) {
      const ringPoints: THREE.Vector3[] = []
      for (let segment = 0; segment < RING_SEGMENTS; segment += 1) {
        const point = warpedRingPoint(segment, ring, clock.elapsedTime)
        const bend = Math.sin(ring * 0.17 + clock.elapsedTime * 0.5) * 0.8
        point.x += Math.sin(point.z * 0.035 + clock.elapsedTime * 0.8) * 0.55 + bend
        point.y += Math.cos(point.z * 0.028 + clock.elapsedTime * 0.6) * 0.38
        point.z += camera.position.z - cameraModulo - 7
        ringPoints.push(point)
      }
      points.push(ringPoints)
    }

    for (let ring = 0; ring < RING_COUNT; ring += 1) {
      for (let segment = 0; segment < RING_SEGMENTS; segment += 1) {
        const a = points[ring][segment]
        const b = points[ring][(segment + 1) % RING_SEGMENTS]
        positions[cursor++] = a.x
        positions[cursor++] = a.y
        positions[cursor++] = a.z
        positions[cursor++] = b.x
        positions[cursor++] = b.y
        positions[cursor++] = b.z
      }
    }

    for (let ring = 0; ring < RING_COUNT - 1; ring += 1) {
      for (let segment = 0; segment < RING_SEGMENTS; segment += 1) {
        const a = points[ring][segment]
        const b = points[ring + 1][segment]
        positions[cursor++] = a.x
        positions[cursor++] = a.y
        positions[cursor++] = a.z
        positions[cursor++] = b.x
        positions[cursor++] = b.y
        positions[cursor++] = b.z
      }
    }

    positionAttribute.needsUpdate = true
    geometry.computeBoundingSphere()
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />
}

function NeuralStrands() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(STRAND_COUNT * 2 * 3)

    for (let i = 0; i < STRAND_COUNT; i += 1) {
      const z = -Math.random() * TUNNEL_LENGTH
      const radius = tunnelRadius(i, 0)
      const angleA = Math.random() * Math.PI * 2
      const angleB = angleA + THREE.MathUtils.randFloat(-0.7, 0.7)
      positions[i * 6] = Math.cos(angleA) * radius.x * THREE.MathUtils.randFloat(0.45, 1.08)
      positions[i * 6 + 1] = Math.sin(angleA) * radius.y * THREE.MathUtils.randFloat(0.45, 1.08)
      positions[i * 6 + 2] = z
      positions[i * 6 + 3] = Math.cos(angleB) * radius.x * THREE.MathUtils.randFloat(0.45, 1.08)
      positions[i * 6 + 4] = Math.sin(angleB) * radius.y * THREE.MathUtils.randFloat(0.45, 1.08)
      positions[i * 6 + 5] = z - THREE.MathUtils.randFloat(2.5, 14)
    }

    const strandGeometry = new THREE.BufferGeometry()
    strandGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return strandGeometry
  }, [])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x65ff4f,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useFrame(({ camera, clock }) => {
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute
    const positions = attribute.array as Float32Array

    for (let i = 0; i < STRAND_COUNT; i += 1) {
      const zA = i * 6 + 2
      const zB = i * 6 + 5
      positions[i * 6] += Math.sin(clock.elapsedTime * 0.3 + i) * 0.001
      positions[i * 6 + 3] += Math.cos(clock.elapsedTime * 0.24 + i) * 0.001

      if (positions[zA] > camera.position.z + 16) {
        const offset = camera.position.z - TUNNEL_LENGTH - Math.random() * 60
        positions[zA] = offset
        positions[zB] = offset - THREE.MathUtils.randFloat(2.5, 14)
      }
    }

    attribute.needsUpdate = true
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />
}

function InstancedFloatingField({
  count,
  geometry,
  material,
  scale,
}: {
  count: number
  geometry: THREE.BufferGeometry
  material: THREE.Material
  scale: [number, number, number]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const items = useMemo(() => {
    return Array.from({ length: count }, () => {
      const item = makeFloatingItem()
      item.scale.multiply(new THREE.Vector3(...scale))
      return item
    })
  }, [count, scale])

  useFrame(({ camera, clock }) => {
    const mesh = meshRef.current
    if (!mesh) {
      return
    }

    items.forEach((item, index) => {
      if (item.position.z > camera.position.z + 18) {
        recycleFloatingItem(item, camera.position.z)
      }

      applyFloatingMatrix(item, dummy, clock.elapsedTime)
      const flicker = 0.82 + Math.sin(clock.elapsedTime * 8 + item.phase) * 0.18
      dummy.scale.multiplyScalar(flicker)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
}

function GhostFigures() {
  const figures = useMemo(
    () =>
      Array.from({ length: FIGURE_COUNT }, (_, index) => ({
        x: THREE.MathUtils.randFloatSpread(5.5),
        y: THREE.MathUtils.randFloat(-2.4, 1.2),
        z: -36 - index * 32 - Math.random() * 24,
        scale: THREE.MathUtils.randFloat(0.7, 1.65),
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  )
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const figureMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x9dff7d,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useFrame(({ camera, clock }) => {
    figures.forEach((figure, index) => {
      const group = groupRefs.current[index]
      if (!group) {
        return
      }

      if (figure.z > camera.position.z + 12) {
        figure.z = camera.position.z - TUNNEL_LENGTH - Math.random() * 60
      }

      group.position.set(
        figure.x + Math.sin(clock.elapsedTime * 0.31 + figure.phase) * 0.4,
        figure.y + Math.cos(clock.elapsedTime * 0.27 + figure.phase) * 0.22,
        figure.z,
      )
      group.rotation.y = Math.sin(clock.elapsedTime * 0.2 + figure.phase) * 0.7
      group.rotation.z = Math.sin(clock.elapsedTime * 0.37 + figure.phase) * 0.11
      group.scale.setScalar(figure.scale * (1 + Math.sin(clock.elapsedTime * 5 + figure.phase) * 0.025))
    })
  })

  useEffect(() => {
    return () => figureMaterial.dispose()
  }, [figureMaterial])

  return (
    <>
      {figures.map((figure, index) => (
        <group
          key={index}
          ref={(node) => {
            groupRefs.current[index] = node
          }}
          position={[figure.x, figure.y, figure.z]}
          scale={figure.scale}
        >
          <mesh material={figureMaterial} position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.22, 7, 6]} />
          </mesh>
          <mesh material={figureMaterial} position={[0, 0.14, 0]} scale={[0.5, 1.15, 0.22]}>
            <boxGeometry args={[0.7, 1.0, 0.42]} />
          </mesh>
          <mesh material={figureMaterial} position={[-0.52, 0.22, 0]} rotation={[0, 0, 0.75]}>
            <boxGeometry args={[0.18, 0.85, 0.18]} />
          </mesh>
          <mesh material={figureMaterial} position={[0.52, 0.18, 0]} rotation={[0, 0, -0.52]}>
            <boxGeometry args={[0.18, 0.85, 0.18]} />
          </mesh>
          <mesh material={figureMaterial} position={[-0.18, -0.66, 0]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.2, 0.92, 0.18]} />
          </mesh>
          <mesh material={figureMaterial} position={[0.18, -0.66, 0]} rotation={[0, 0, 0.16]}>
            <boxGeometry args={[0.2, 0.92, 0.18]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function AnalogOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    let frame = 0
    let animation = 0
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = () => {
      frame += 1
      animation = requestAnimationFrame(draw)
      const width = window.innerWidth
      const height = window.innerHeight
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'

      context.fillStyle = 'rgba(80, 255, 70, 0.018)'
      for (let y = frame % 4; y < height; y += 4) {
        context.fillRect(0, y, width, 1)
      }

      context.fillStyle = 'rgba(255, 255, 255, 0.032)'
      for (let i = 0; i < 80; i += 1) {
        context.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2.4 + 0.5, 1)
      }

      if (frame % 18 < 3) {
        const tearY = Math.random() * height
        context.fillStyle = 'rgba(180, 255, 170, 0.08)'
        context.fillRect(0, tearY, width, Math.random() * 2 + 1)
      }

      const gradient = context.createRadialGradient(width * 0.5, height * 0.52, width * 0.18, width * 0.5, height * 0.52, width * 0.68)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.62)')
      context.globalCompositeOperation = 'source-over'
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animation)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0.78,
        mixBlendMode: 'screen',
      }}
    />
  )
}

function TunnelFallback() {
  useEffect(() => {
    let animation = 0

    const updateControlRoomOpacity = () => {
      const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const progress = THREE.MathUtils.clamp(window.scrollY / range, 0, 1)
      const eased = progress * progress * (3 - 2 * progress)
      const opacity = THREE.MathUtils.clamp((eased - 0.75) / 0.25, 0, 1)

      document.documentElement.style.setProperty('--control-room-opacity', String(opacity))
      animation = requestAnimationFrame(updateControlRoomOpacity)
    }

    updateControlRoomOpacity()

    return () => cancelAnimationFrame(animation)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 50% 44%, rgba(73, 255, 55, 0.13), transparent 42%), linear-gradient(180deg, #000 0%, #020602 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          background:
            'repeating-linear-gradient(90deg, rgba(73,255,55,0.12) 0, rgba(73,255,55,0.12) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(0deg, rgba(85,255,242,0.08) 0, rgba(85,255,242,0.08) 1px, transparent 1px, transparent 34px)',
          opacity: 0.42,
          transform: 'perspective(560px) rotateX(62deg) translateY(18vh)',
          transformOrigin: '50% 100%',
        }}
      />
    </div>
  )
}

function CursedCyberspace({ scrollTrackRef }: { scrollTrackRef: React.RefObject<HTMLDivElement> }) {
  const panelGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 0.025), [])
  const shardGeometry = useMemo(() => new THREE.TetrahedronGeometry(0.42, 0), [])
  const barGeometry = useMemo(() => new THREE.BoxGeometry(1, 0.045, 0.045), [])
  const panelMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: TOXIC_GREEN,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const shardMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x7cff65,
        wireframe: true,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const barMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: CYAN_GHOST,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      panelGeometry.dispose()
      shardGeometry.dispose()
      barGeometry.dispose()
      panelMaterial.dispose()
      shardMaterial.dispose()
      barMaterial.dispose()
    }
  }, [barGeometry, barMaterial, panelGeometry, panelMaterial, shardGeometry, shardMaterial])

  return (
    <>
      <SceneSetup />
      <CameraRig scrollTrackRef={scrollTrackRef} />
      <ambientLight color={DARK_GREEN} intensity={0.7} />
      <pointLight color={TOXIC_GREEN} intensity={10} distance={28} position={[0, 0, -16]} />
      <pointLight color={CYAN_GHOST} intensity={2.2} distance={24} position={[-6, 4, -40]} />
      <WarpedWireTunnel />
      <NeuralStrands />
      <InstancedFloatingField count={PANEL_COUNT} geometry={panelGeometry} material={panelMaterial} scale={[2.6, 1.8, 1]} />
      <InstancedFloatingField count={DEBRIS_COUNT} geometry={shardGeometry} material={shardMaterial} scale={[1.1, 1.1, 1.1]} />
      <InstancedFloatingField count={70} geometry={barGeometry} material={barMaterial} scale={[4.5, 1, 1]} />
      <GhostFigures />
      <PostProcessing />
    </>
  )
}

const GlassTunnel: FC = () => {
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const [webglFailed, setWebglFailed] = useState(() => !canUseWebGL())

  useEffect(() => {
    const handleContextCreationError = (event: Event) => {
      event.preventDefault()
      setWebglFailed(true)
    }

    const handleResize = () => {
      if (window.innerWidth < WEBGL_MIN_WIDTH) {
        setWebglFailed(true)
      }
    }

    window.addEventListener('webglcontextcreationerror', handleContextCreationError)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('webglcontextcreationerror', handleContextCreationError)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      {webglFailed ? (
        <TunnelFallback />
      ) : (
        <WebGLErrorBoundary onCrash={() => setWebglFailed(true)}>
          <Canvas
            camera={{ position: [0, 0.15, CAMERA_START_Z], fov: 72, near: 0.1, far: 360 }}
            frameloop="always"
            gl={{ antialias: false, alpha: false, powerPreference: 'default' }}
            dpr={[0.75, 1.1]}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                'webglcontextlost',
                event => {
                  event.preventDefault()
                  setWebglFailed(true)
                },
                { once: true },
              )
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 0,
              pointerEvents: 'none',
              background: '#000',
              imageRendering: 'pixelated',
            }}
          >
            <CursedCyberspace scrollTrackRef={scrollTrackRef} />
          </Canvas>
        </WebGLErrorBoundary>
      )}
      <AnalogOverlay />
      <div
        ref={scrollTrackRef}
        className="scroll-track"
        aria-hidden="true"
        style={{ height: '600vh', pointerEvents: 'none' }}
      />
    </>
  )
}

export default GlassTunnel
