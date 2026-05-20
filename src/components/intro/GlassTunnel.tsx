import { useEffect, useRef, useState, type FC } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import character03Url from '@assets/charcter03.png'

const W = 10.5
const H = 7.2
const L = 62
const CELL = 1.12
const DEPTH = Math.round(L / CELL)
const CAM_Z_MIN = -48
const CAM_Z_MAX = 0
const WEBGL_MIN_WIDTH = 700
const PHOSPHOR = 0x4fbd62
const PHOSPHOR_SOFT = 0x9bd89a
const HAZE = 0x123f22

type Face = 'floor' | 'ceiling' | 'left' | 'right' | 'back'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

const warpAt = (x: number, y: number, z: number) => {
  const depth = Math.abs(z) / L
  const roomSag = Math.sin(depth * Math.PI * 2.7)
  const twitch = Math.sin(z * 0.41 + x * 1.7) * 0.035 + Math.cos(z * 0.23 + y * 1.3) * 0.028

  return {
    x:
      x +
      Math.sin(z * 0.18 + y * 0.9) * (0.07 + depth * 0.19) +
      roomSag * 0.08 +
      twitch,
    y:
      y +
      Math.cos(z * 0.21 + x * 0.7) * (0.055 + depth * 0.13) -
      depth * 0.18 +
      Math.sin(z * 0.08) * 0.075,
    z: z + Math.sin(x * 0.56 + y * 0.31 + depth * 9.2) * (0.08 + depth * 0.2),
  }
}

function pushWarpedLine(
  points: number[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  pieces = 18,
) {
  let prev = warpAt(ax, ay, az)

  for (let i = 1; i <= pieces; i += 1) {
    const t = i / pieces
    const next = warpAt(
      THREE.MathUtils.lerp(ax, bx, t),
      THREE.MathUtils.lerp(ay, by, t),
      THREE.MathUtils.lerp(az, bz, t),
    )

    points.push(prev.x, prev.y, prev.z, next.x, next.y, next.z)
    prev = next
  }
}

function buildWarpedRoomGeometry(face: Face) {
  const points: number[] = []
  const xMin = -W / 2
  const xMax = W / 2
  const yMin = -H / 2
  const yMax = H / 2

  if (face === 'floor' || face === 'ceiling') {
    const y = face === 'floor' ? yMin : yMax
    const cols = Math.round(W / CELL)

    for (let c = 0; c <= cols; c += 1) {
      const x = xMin + c * (W / cols) + Math.sin(c * 1.7) * 0.09
      pushWarpedLine(points, x, y, 0.5, x + Math.sin(c) * 0.2, y, -L, 22)
    }

    for (let d = 0; d <= DEPTH; d += 1) {
      const z = -d * CELL
      const inset = Math.sin(d * 0.57) * 0.2
      pushWarpedLine(points, xMin + inset, y, z, xMax + inset * 0.35, y, z, 7)
    }
  }

  if (face === 'left' || face === 'right') {
    const x = face === 'left' ? xMin : xMax
    const rows = Math.round(H / CELL)

    for (let r = 0; r <= rows; r += 1) {
      const y = yMin + r * (H / rows) + Math.cos(r * 1.31) * 0.08
      pushWarpedLine(points, x, y, 0.5, x, y + Math.sin(r) * 0.16, -L, 22)
    }

    for (let d = 0; d <= DEPTH; d += 1) {
      const z = -d * CELL
      const lean = Math.cos(d * 0.48) * 0.16
      pushWarpedLine(points, x, yMin + lean, z, x, yMax + lean * 0.45, z, 7)
    }
  }

  if (face === 'back') {
    const cols = 8
    const rows = 6

    for (let c = 0; c <= cols; c += 1) {
      const x = xMin + c * (W / cols)
      pushWarpedLine(points, x, yMin, -L, x + Math.sin(c) * 0.18, yMax, -L, 6)
    }

    for (let r = 0; r <= rows; r += 1) {
      const y = yMin + r * (H / rows)
      pushWarpedLine(points, xMin, y, -L, xMax, y + Math.cos(r) * 0.12, -L, 6)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

function canUseWebGL() {
  if (typeof window === 'undefined') return false
  if (window.innerWidth < WEBGL_MIN_WIDTH) return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!ctx) return false
  ;(ctx as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  return true
}

function createSignalMaterial(texture: THREE.Texture, opacity: number, tint: THREE.ColorRepresentation) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      time: { value: 0 },
      progress: { value: 0 },
      opacity: { value: opacity },
      tint: { value: new THREE.Color(tint) },
      split: { value: 0.002 },
      tear: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      uniform float progress;
      uniform float tear;

      void main() {
        vUv = uv;
        vec3 p = position;
        float line = step(0.965, fract(vUv.y * 34.0 + time * 0.0015));
        float slow = sin(vUv.y * 18.0 + time * 0.0011) * (0.012 + progress * 0.025);
        p.x += slow + line * tear * 0.18;
        p.y += sin(time * 0.0007 + vUv.x * 3.14159) * 0.01;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform float time;
      uniform float progress;
      uniform float opacity;
      uniform vec3 tint;
      uniform float split;
      uniform float tear;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        float tearBand = step(0.985, fract(vUv.y * 9.0 + time * 0.0008));
        float tearShift = tearBand * tear * 0.08;
        vec2 uv = vUv + vec2(tearShift + sin(vUv.y * 60.0 + time * 0.001) * 0.0015, 0.0);
        float r = texture2D(map, uv + vec2(split, 0.0)).r;
        float g = texture2D(map, uv).g;
        float b = texture2D(map, uv - vec2(split, 0.0)).b;
        vec3 src = vec3(r, g, b);
        float luma = dot(src, vec3(0.299, 0.587, 0.114));
        float mask = smoothstep(0.055, 0.34, luma);
        float scan = 0.72 + 0.28 * sin(vUv.y * 900.0);
        float noise = rand(vUv * vec2(320.0, 180.0) + time * 0.0003) * 0.09;
        float pulse = 0.86 + sin(time * 0.0013) * 0.08 + sin(time * 0.00037) * 0.06;
        vec3 signal = mix(tint * 0.38, vec3(0.82, 1.0, 0.66), clamp(luma * 1.5, 0.0, 1.0));
        signal += vec3(0.03, 0.13, 0.08) * noise;
        float alpha = mask * opacity * scan * pulse * (0.62 + progress * 0.42);
        alpha *= 1.0 - tearBand * tear * 0.42;
        gl_FragColor = vec4(signal, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
}

function createSignalEntity(imageUrl: string) {
  const group = new THREE.Group()
  const texture = new THREE.TextureLoader().load(imageUrl)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  const geometry = new THREE.PlaneGeometry(4.2, 8.9, 18, 34)
  const mainMaterial = createSignalMaterial(texture, 0.28, PHOSPHOR_SOFT)
  const main = new THREE.Mesh(geometry, mainMaterial)
  main.position.set(0, -0.35, 0)
  group.add(main)

  const ghostMaterials = [
    createSignalMaterial(texture, 0.075, 0x7bbd90),
    createSignalMaterial(texture, 0.055, 0x91ffd2),
  ]

  ghostMaterials.forEach((material, index) => {
    const ghost = new THREE.Mesh(geometry, material)
    ghost.position.set(index === 0 ? -0.18 : 0.2, -0.34, -0.05 - index * 0.04)
    ghost.scale.set(1.015 + index * 0.025, 1.01 + index * 0.02, 1)
    group.add(ghost)
  })

  return {
    group,
    geometry,
    texture,
    materials: [mainMaterial, ...ghostMaterials],
  }
}

function drawAnalogOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, progress: number) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  const lineGap = Math.max(3, Math.floor(4 * window.devicePixelRatio))
  ctx.fillStyle = `rgba(0,0,0,${0.09 + progress * 0.08})`
  for (let y = 0; y < height; y += lineGap) {
    ctx.fillRect(0, y, width, Math.max(1, Math.floor(lineGap * 0.42)))
  }

  ctx.globalCompositeOperation = 'screen'
  const tearCount = 2 + Math.floor(progress * 4)
  for (let i = 0; i < tearCount; i += 1) {
    const y = Math.floor((Math.sin(time * 0.0011 + i * 4.7) * 0.5 + 0.5) * height)
    const h = Math.max(1, Math.floor((1 + progress * 2) * window.devicePixelRatio))
    const x = Math.sin(time * 0.0018 + i) * 14 * window.devicePixelRatio
    ctx.fillStyle = `rgba(108,196,104,${0.025 + progress * 0.035})`
    ctx.fillRect(x, y, width, h)
  }

  for (let i = 0; i < 70 + progress * 120; i += 1) {
    const x = Math.random() * width
    const y = Math.random() * height
    const alpha = Math.random() * (0.028 + progress * 0.04)
    ctx.fillStyle = `rgba(128,210,120,${alpha})`
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1)
  }

  const vignette = ctx.createRadialGradient(width * 0.47, height * 0.48, width * 0.08, width * 0.5, height * 0.5, width * 0.72)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(0.58, `rgba(0,0,0,${0.2 + progress * 0.18})`)
  vignette.addColorStop(1, `rgba(0,0,0,${0.9 + progress * 0.06})`)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
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
        background:
          'radial-gradient(circle at 48% 48%, rgba(42,255,80,0.12), transparent 28%), #000',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          background:
            'repeating-linear-gradient(92deg,rgba(77,169,87,0.26) 0,rgba(77,169,87,0.26) 2px,transparent 2px,transparent 44px),' +
            'repeating-linear-gradient(4deg,rgba(77,169,87,0.18) 0,rgba(77,169,87,0.18) 2px,transparent 2px,transparent 43px)',
          opacity: 0.7,
          filter: 'blur(0.45px) drop-shadow(0 0 7px rgba(79,189,98,0.45))',
          transform: 'perspective(560px) rotateX(62deg) rotateZ(-2deg) translateY(19vh)',
          transformOrigin: '46% 78%',
        }}
      />
    </div>
  )
}

const GlassTunnel: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
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
    const overlay = overlayRef.current
    const overlayCtx = overlay?.getContext('2d')
    if (!canvas || !overlay || !overlayCtx) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.3))
    renderer.setClearColor(0x000000)

    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault()
        setWebglFailed(true)
      },
      { once: true },
    )

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x010401, 0.016)

    const camera = new THREE.PerspectiveCamera(67, window.innerWidth / window.innerHeight, 0.1, 130)
    camera.position.set(-0.38, 0.42, 1.2)

    const roomGroup = new THREE.Group()
    roomGroup.rotation.set(0.014, -0.03, -0.015)
    scene.add(roomGroup)

    const matCore = new THREE.LineBasicMaterial({
      color: PHOSPHOR,
      transparent: true,
      opacity: 0.7,
    })
    const matBloom = new THREE.LineBasicMaterial({
      color: PHOSPHOR,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const matBleed = new THREE.LineBasicMaterial({
      color: PHOSPHOR_SOFT,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const geometries = (['floor', 'ceiling', 'left', 'right', 'back'] as Face[]).map(buildWarpedRoomGeometry)
    geometries.forEach((geometry, index) => {
      const core = new THREE.LineSegments(geometry, matCore)
      core.frustumCulled = false
      roomGroup.add(core)

      const bloom = new THREE.LineSegments(geometry, matBloom)
      bloom.frustumCulled = false
      bloom.scale.set(1.003, 1.003, 1)
      bloom.position.set(index % 2 ? 0.012 : -0.012, index > 2 ? 0.008 : -0.006, 0)
      roomGroup.add(bloom)

      const bleed = new THREE.LineSegments(geometry, matBleed)
      bleed.frustumCulled = false
      bleed.scale.set(1.008, 1.006, 1)
      bleed.position.set(index % 2 ? -0.022 : 0.024, index > 1 ? 0.012 : -0.012, 0.01)
      roomGroup.add(bleed)
    })

    const hazeGeometry = new THREE.SphereGeometry(1, 24, 12)
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: HAZE,
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial)
    haze.scale.set(12, 7, 25)
    haze.position.set(-0.2, -0.4, -32)
    scene.add(haze)

    const entity = createSignalEntity(character03Url)
    entity.group.position.set(-0.7, -0.3, -50)
    scene.add(entity.group)

    const pointLight = new THREE.PointLight(PHOSPHOR, 1.35, 25)
    scene.add(pointLight)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.46, 0.78, 0.18),
    )

    let targetZ = 0
    let currentZ = 0
    let rafId = 0

    const setOverlaySize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5)
      overlay.width = Math.floor(window.innerWidth * pixelRatio)
      overlay.height = Math.floor(window.innerHeight * pixelRatio)
      overlay.style.width = `${window.innerWidth}px`
      overlay.style.height = `${window.innerHeight}px`
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetZ = THREE.MathUtils.clamp(targetZ - e.deltaY * 0.036, CAM_Z_MIN, CAM_Z_MAX)
    }

    const onResizeGL = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      setOverlaySize()
    }

    setOverlaySize()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResizeGL)

    const animate = (time = 0) => {
      rafId = requestAnimationFrame(animate)

      currentZ += (targetZ - currentZ) * 0.042
      const progress = clamp01(-currentZ / Math.abs(CAM_Z_MIN))
      const attack = smoothstep(0.06, 1, progress)
      const distortion = 0.22 + attack * 0.62
      const tearGate = Math.sin(time * 0.019) > 0.94 ? 1 : 0

      camera.fov = 66 - attack * 5 + Math.sin(time * 0.00055) * 0.45
      camera.updateProjectionMatrix()
      camera.position.set(
        -0.48 + Math.sin(time * 0.00034) * 0.07 + Math.sin(time * 0.0031) * 0.003 * distortion,
        0.4 + Math.cos(time * 0.00031) * 0.05 + Math.sin(time * 0.0027) * 0.003 * distortion,
        currentZ + 1.2,
      )
      camera.rotation.set(
        Math.sin(time * 0.00028) * 0.006,
        -0.035 + Math.cos(time * 0.00024) * 0.009,
        -0.018 + Math.sin(time * 0.0004) * 0.006,
      )
      camera.lookAt(
        -0.42 + Math.sin(time * 0.00042) * 0.18,
        -0.06 + Math.cos(time * 0.00034) * 0.1,
        currentZ - 18 - attack * 6,
      )

      roomGroup.position.set(
        Math.sin(time * 0.00095) * 0.018 * distortion,
        Math.cos(time * 0.0008) * 0.014 * distortion,
        Math.sin(time * 0.00055) * 0.055,
      )
      roomGroup.rotation.set(
        0.014 + Math.sin(time * 0.00048) * 0.006,
        -0.03 + Math.cos(time * 0.00038) * 0.008,
        -0.015 + Math.sin(time * 0.00056) * 0.008,
      )
      roomGroup.scale.set(1 + attack * 0.035, 1 - attack * 0.018, 1)

      const entityZ = THREE.MathUtils.lerp(-50, currentZ - 15.5, attack)
      entity.group.position.set(
        -0.7 + Math.sin(time * 0.00072) * (0.11 + attack * 0.08) + tearGate * 0.035,
        -0.45 + Math.cos(time * 0.00088) * 0.07,
        entityZ,
      )
      entity.group.rotation.set(
        Math.sin(time * 0.0009) * 0.045,
        Math.cos(time * 0.00072) * 0.07,
        Math.sin(time * 0.00082) * 0.028,
      )
      const entityScale = THREE.MathUtils.lerp(0.42, 1.55, attack)
      entity.group.scale.setScalar(entityScale)
      const phaseDrop = Math.sin(time * 0.0017) > 0.985 ? 0.32 : 1
      entity.group.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          const baseX = index === 0 ? 0 : index === 1 ? -0.18 : 0.2
          const baseOpacity = index === 0 ? 0.16 + attack * 0.24 : 0.045 + attack * 0.055
          child.position.x = baseX + Math.sin(time * 0.0014 + index * 2.4) * 0.035 * distortion
          child.material.uniforms.time.value = time
          child.material.uniforms.progress.value = attack
          child.material.uniforms.opacity.value = baseOpacity * phaseDrop
          child.material.uniforms.split.value = 0.0012 + attack * 0.0018
          child.material.uniforms.tear.value = tearGate * (0.28 + attack * 0.32)
        }
      })

      matCore.opacity = 0.66 + Math.sin(time * 0.004) * 0.025 - attack * 0.04
      matBloom.opacity = 0.12 + attack * 0.055 + Math.sin(time * 0.006) * 0.018
      matBleed.opacity = 0.045 + attack * 0.035 + tearGate * 0.018
      hazeMaterial.opacity = 0.055 + attack * 0.075
      pointLight.position.set(-0.4, 0.2, currentZ - 9)
      pointLight.intensity = 1.15 + attack * 1.1

      const controlOpacity = smoothstep(0.9, 1, progress)
      document.documentElement.style.setProperty('--control-room-opacity', String(controlOpacity))
      canvas.style.filter = `contrast(${1.08 + attack * 0.12}) brightness(${0.68 - attack * 0.08}) saturate(${0.9 + attack * 0.08})`
      canvas.style.transform = `translate(${Math.sin(time * 0.0016) * 0.08 * distortion}px, ${Math.cos(time * 0.0012) * 0.07 * distortion}px) scale(${1 + attack * 0.004})`
      overlay.style.opacity = String(0.52 + attack * 0.18)

      composer.render()
      drawAnalogOverlay(overlayCtx, overlay.width, overlay.height, time, progress)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResizeGL)
      document.documentElement.style.setProperty('--control-room-opacity', '0')
      matCore.dispose()
      matBloom.dispose()
      matBleed.dispose()
      hazeGeometry.dispose()
      hazeMaterial.dispose()
      entity.texture.dispose()
      entity.geometry.dispose()
      entity.group.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.dispose()
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      composer.dispose()
      renderer.dispose()
    }
  }, [webglFailed])

  return (
    <>
      {webglFailed ? (
        <TunnelFallback />
      ) : (
        <>
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
              transformOrigin: '50% 50%',
              willChange: 'filter, transform',
            }}
          />
          <canvas
            ref={overlayRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 2,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}
    </>
  )
}

export default GlassTunnel
