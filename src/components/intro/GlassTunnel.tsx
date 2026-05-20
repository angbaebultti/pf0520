import { useEffect, useRef, useState, type FC } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import character03Url from '@assets/charcter03.png'
import character04Url from '@assets/charcter04.png'

const L = 72
const CELL = 1.12
const TUNNEL_RADIUS = 4.45
const CAM_Z_MIN = -48
const CAM_Z_MAX = 0
const WEBGL_MIN_WIDTH = 700
const PHOSPHOR_BLUE = 0x5b6cff
const PHOSPHOR_SOFT = 0x6e7fd7
const CYBER_NAVY = 0x3a4a7a
const SIGNAL_CRIMSON = 0x8b2e3f
const SIGNAL_RED = 0xb44b5f
const ENTITY_GLOW = 0xb7c8ff
const HAZE = CYBER_NAVY
const BACKGROUND = 0x05070b

const easeInOutSine = (value: number) => 0.5 - Math.cos(clamp01(value) * Math.PI) * 0.5

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function createTerminalDataTexture(variant: 'blue' | 'red' | 'white') {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 2048
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const fallback = new THREE.Texture(canvas)
    fallback.needsUpdate = true
    return fallback
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const primary = variant === 'red' ? '180,75,95' : variant === 'white' ? '205,230,255' : '0,205,255'
  const secondary = variant === 'red' ? '190,64,125' : variant === 'white' ? '91,108,255' : '91,108,255'
  const columnCount = variant === 'red' ? 64 : 132

  for (let col = 0; col < columnCount; col += 1) {
    const x = (col * 47 + (col * col * 11) % 83) % canvas.width
    const fontSize = col % 9 === 0 ? 28 : col % 5 === 0 ? 18 : 13
    const rowStep = fontSize * (col % 4 === 0 ? 1.28 : 1.08)
    const yOffset = -((col * 131) % 360)
    const alphaBase = variant === 'red' ? 0.13 : col % 7 === 0 ? 0.62 : 0.34

    ctx.font = `${fontSize}px Consolas, "Courier New", monospace`
    ctx.shadowColor = `rgba(${col % 6 === 0 ? secondary : primary},${variant === 'red' ? 0.25 : 0.55})`
    ctx.shadowBlur = variant === 'red' ? 5 : col % 9 === 0 ? 16 : 7

    for (let y = yOffset; y < canvas.height + rowStep; y += rowStep) {
      const bit = (Math.sin(col * 12.9898 + y * 0.071) > 0 ? '1' : '0')
      const dropout = Math.sin(col * 4.13 + y * 0.021) > 0.78
      if (dropout) continue

      const isHot = Math.sin(col * 0.91 + y * 0.017) > 0.965
      const color = isHot ? '230,250,255' : col % 11 === 0 ? secondary : primary
      const alpha = Math.min(0.95, alphaBase + (isHot ? 0.28 : 0) + ((col * 17 + y) % 19) / 160)
      ctx.fillStyle = `rgba(${color},${alpha})`
      ctx.fillText(bit, x, y)

      if (col % 13 === 0 && y % (rowStep * 5) < rowStep) {
        ctx.font = `${Math.max(8, fontSize * 0.48)}px Consolas, "Courier New", monospace`
        ctx.fillStyle = `rgba(${primary},${alpha * 0.58})`
        ctx.fillText('010110', x + fontSize * 0.75, y + fontSize * 0.24)
        ctx.font = `${fontSize}px Consolas, "Courier New", monospace`
      }
    }
  }

  ctx.shadowBlur = 0
  for (let cluster = 0; cluster < 95; cluster += 1) {
    const x = (cluster * 137) % canvas.width
    const y = (cluster * 311) % canvas.height
    const lines = 7 + (cluster % 10)
    const size = 7 + (cluster % 4)
    ctx.font = `${size}px Consolas, "Courier New", monospace`
    ctx.fillStyle = `rgba(${cluster % 12 === 0 ? '180,75,95' : primary},${variant === 'red' ? 0.16 : 0.3})`
    for (let row = 0; row < lines; row += 1) {
      const bits = row % 3 === 0 ? '1011010010110' : '0100110101101'
      ctx.fillText(bits, x, y + row * (size + 1))
    }
  }

  for (let glow = 0; glow < 28; glow += 1) {
    const x = (glow * 251) % canvas.width
    const y = (glow * 439) % canvas.height
    const radius = 18 + (glow % 5) * 8
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(${variant === 'red' ? '180,75,95' : '0,205,255'},${variant === 'red' ? 0.16 : 0.32})`)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.repeat.set(1.15, 2.35)
  texture.needsUpdate = true
  return texture
}

function createDataWallMaterial(
  dataMap: THREE.Texture,
  tint: THREE.ColorRepresentation,
  accent: THREE.ColorRepresentation,
  opacity: number,
  flowSpeed: number,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      dataMap: { value: dataMap },
      time: { value: 0 },
      pull: { value: 0 },
      opacity: { value: opacity },
      flowSpeed: { value: flowSpeed },
      tint: { value: new THREE.Color(tint) },
      accent: { value: new THREE.Color(accent) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vDepth;
      uniform float time;
      uniform float pull;

      void main() {
        vUv = uv;
        vec3 p = position;
        float depth = clamp(abs(p.z) / ${L.toFixed(1)}, 0.0, 1.0);
        float angle = atan(p.y, p.x);
        float suction = 1.0 - pull * 0.045 * smoothstep(0.0, 1.0, depth);

        p.xy *= suction + sin(depth * 16.0 - time * 0.0012 + angle * 2.0) * 0.004;
        p.z += sin(angle * 5.0 + time * 0.0008 + depth * 10.0) * (0.01 + pull * 0.022);
        vDepth = depth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vDepth;
      uniform sampler2D dataMap;
      uniform float time;
      uniform float pull;
      uniform float opacity;
      uniform float flowSpeed;
      uniform vec3 tint;
      uniform vec3 accent;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        float depthCompress = mix(1.0, 1.45, smoothstep(0.0, 1.0, vDepth));
        uv.x = fract((uv.x - 0.5) * depthCompress + 0.5 + sin(vUv.y * 6.0 + time * 0.00025) * 0.01);
        uv.y += time * flowSpeed * (0.0002 + pull * 0.00024) + vDepth * 0.38;
        vec2 uvFast = vec2(
          fract((vUv.x - 0.5) * (depthCompress * 1.18) + 0.5 + time * 0.00005),
          vUv.y * 1.22 + time * (0.00032 + pull * 0.00032) + vDepth * 0.55
        );
        vec4 textA = texture2D(dataMap, uv);
        vec4 textB = texture2D(dataMap, uvFast + vec2(hash(floor(vUv * 32.0)) * 0.03, 0.0));
        float blocks = step(0.955 - pull * 0.025, hash(floor(vec2(vUv.x * 96.0, vUv.y * 180.0 - time * 0.02))));
        float packets = step(0.985 - pull * 0.018, hash(floor(vec2(vUv.x * 140.0 + time * 0.01, vUv.y * 220.0))));
        float scan = 0.68 + 0.32 * sin(gl_FragCoord.y * 1.85 + time * 0.0011);
        float interference = step(0.985 - pull * 0.02, hash(vec2(floor(gl_FragCoord.y / 3.0), floor(time * 0.045))));
        float lumaA = dot(textA.rgb, vec3(0.299, 0.587, 0.114));
        float lumaB = dot(textB.rgb, vec3(0.299, 0.587, 0.114));
        float data = max(max(max(textA.a, textB.a * 0.78), lumaA * 1.25), lumaB * 0.9);
        data = max(data, blocks * 0.16 + packets * 0.28);
        vec3 base = max(textA.rgb, textB.rgb * 0.72);
        base = mix(tint * 0.06, base + tint * 0.16, clamp(data * 2.4, 0.0, 1.0));
        base = mix(base, vec3(0.82, 0.9, 1.0), packets * 0.28);
        base = mix(base, accent, max(interference * 0.8, blocks * step(0.78, pull)) * (0.18 + pull * 0.22));

        float alpha = opacity * scan * (0.08 + data * 1.65 + packets * 0.38);
        alpha *= 1.0 - smoothstep(0.9, 1.0, vDepth) * 0.2;
        alpha *= 1.0 + interference * 0.35;
        gl_FragColor = vec4(base, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  })
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

function createSignalMaterial(
  texture: THREE.Texture,
  nextTexture: THREE.Texture,
  opacity: number,
  tint: THREE.ColorRepresentation,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      mapNext: { value: nextTexture },
      time: { value: 0 },
      progress: { value: 0 },
      transform: { value: 0 },
      pull: { value: 0 },
      opacity: { value: opacity },
      tint: { value: new THREE.Color(tint) },
      split: { value: 0.002 },
      tear: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      uniform float progress;
      uniform float transform;
      uniform float pull;
      uniform float tear;

      void main() {
        vUv = uv;
        vec3 p = position;
        float line = step(0.965, fract(vUv.y * 34.0 + time * 0.0015));
        float gravity = smoothstep(0.08, 1.0, transform);
        float centerFalloff = abs(vUv.x - 0.5);
        float slow = sin(vUv.y * 18.0 + time * 0.0011) * (0.01 + progress * 0.016 + gravity * 0.022);
        p.x += slow + line * tear * (0.1 + gravity * 0.16);
        p.x *= 1.0 - gravity * 0.12 * (1.0 - centerFalloff);
        p.y *= 1.0 + pull * 0.18 + gravity * 0.12;
        p.y += sin(time * 0.0007 + vUv.x * 3.14159) * (0.008 + progress * 0.006 + gravity * 0.014);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform sampler2D mapNext;
      uniform float time;
      uniform float progress;
      uniform float transform;
      uniform float pull;
      uniform float opacity;
      uniform vec3 tint;
      uniform float split;
      uniform float tear;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        float tearBand = step(0.989, fract(vUv.y * 8.0 + time * 0.00065));
        float gravity = smoothstep(0.08, 1.0, transform);
        float fragment = rand(vec2(floor(vUv.y * 58.0), floor(time * 0.012)));
        float transition = smoothstep(0.02, 0.98, transform);
        float tearShift = tearBand * tear * (0.045 + gravity * 0.085);
        vec2 center = vec2(0.5, 0.48);
        vec2 radial = normalize(vUv - center + vec2(0.0001));
        float inwardSmear = gravity * pull * 0.045 * (0.35 + fragment);
        vec2 uv = vUv - radial * inwardSmear;
        uv += vec2(
          tearShift + sin(vUv.y * 52.0 + time * 0.001) * (0.001 + progress * 0.0012 + gravity * 0.0028),
          sin(vUv.x * 23.0 + time * 0.0008) * gravity * 0.003
        );
        vec2 oldUv = uv + vec2((fragment - 0.5) * gravity * 0.018, 0.0);
        vec2 nextUv = uv - radial * gravity * 0.018 + vec2(sin(vUv.y * 91.0 + time * 0.0014) * gravity * 0.006, 0.0);
        vec3 oldSrc = vec3(
          texture2D(map, oldUv + vec2(split, 0.0)).r,
          texture2D(map, oldUv).g,
          texture2D(map, oldUv - vec2(split, 0.0)).b
        );
        vec3 nextSrc = vec3(
          texture2D(mapNext, nextUv + vec2(split * 1.35, 0.0)).r,
          texture2D(mapNext, nextUv).g,
          texture2D(mapNext, nextUv - vec2(split * 1.35, 0.0)).b
        );
        float scanFragment = step(0.28 + transition * 0.28, rand(vec2(floor(vUv.y * 120.0), floor(transform * 18.0))));
        vec3 src = mix(oldSrc, nextSrc, clamp(transition + (fragment - 0.5) * gravity * 0.28, 0.0, 1.0));
        float luma = dot(src, vec3(0.299, 0.587, 0.114));
        float mask = smoothstep(0.055, 0.34, luma);
        float scan = 0.72 + 0.28 * sin(vUv.y * 900.0);
        float noiseSeed = rand(vUv * vec2(320.0, 180.0) + time * 0.0003);
        float noise = noiseSeed * (0.055 + progress * 0.12);
        float pulse = 0.9 + sin(time * 0.0011) * 0.035 + sin(time * 0.00037) * 0.035;
        vec2 codeCell = floor((vUv * vec2(42.0, 96.0)) + vec2(-time * (0.0007 + pull * 0.0018), time * 0.0012));
        float dataBit = step(0.76, rand(codeCell + floor(transform * 21.0)));
        float dataColumn = step(0.9, rand(vec2(floor(vUv.x * 28.0), floor(time * 0.012))));
        float dataFlow = smoothstep(0.12, 0.92, fract(vUv.y * (18.0 + pull * 16.0) + time * (0.0009 + pull * 0.0022)));
        vec3 coldPhosphor = vec3(0.66, 0.73, 1.0);
        vec3 warningRed = vec3(0.70, 0.29, 0.37);
        float redGlitch = smoothstep(0.78, 1.0, gravity) * step(0.93, fragment + tearBand * 0.12);
        vec3 signal = mix(tint * 0.46, coldPhosphor, clamp(luma * 1.18, 0.0, 1.0));
        signal = mix(signal, vec3(0.78, 0.84, 1.0), dataBit * dataFlow * (0.18 + pull * 0.22));
        signal = mix(signal, warningRed, redGlitch * (0.32 + tear * 0.22));
        signal += vec3(0.025, 0.035, 0.075) * noise;
        float decay = smoothstep(0.58, 1.0, progress);
        float finalResidue = pow(progress, 4.0);
        float dissolve = mix(1.0, 0.72 + noiseSeed * 0.18, decay);
        float alpha = mask * opacity * scan * pulse * mix(1.0, 0.58, finalResidue) * dissolve;
        alpha *= 0.86 + dataBit * dataFlow * 0.32 + dataColumn * pull * 0.18;
        alpha *= mix(1.0, 0.62 + scanFragment * 0.32, gravity * 0.55);
        alpha *= 1.0 - tearBand * tear * (0.24 + gravity * 0.2);
        gl_FragColor = vec4(signal, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
}

function createSignalEntity(imageUrl: string, nextImageUrl: string) {
  const group = new THREE.Group()
  const loader = new THREE.TextureLoader()
  const texture = loader.load(imageUrl)
  const nextTexture = loader.load(nextImageUrl)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  nextTexture.colorSpace = THREE.SRGBColorSpace
  nextTexture.minFilter = THREE.LinearFilter
  nextTexture.magFilter = THREE.LinearFilter

  const geometry = new THREE.PlaneGeometry(4.2, 8.9, 18, 34)
  const mainMaterial = createSignalMaterial(texture, nextTexture, 0.22, ENTITY_GLOW)
  const main = new THREE.Mesh(geometry, mainMaterial)
  main.position.set(0, -0.35, 0)
  group.add(main)

  const ghostMaterials = [
    createSignalMaterial(texture, nextTexture, 0.052, PHOSPHOR_SOFT),
    createSignalMaterial(texture, nextTexture, 0.038, SIGNAL_CRIMSON),
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
    nextTexture,
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
    const redPulse = Math.max(0, Math.sin(time * 0.0014 + i * 2.1)) * progress
    ctx.fillStyle = redPulse > 0.72
      ? `rgba(180,75,95,${0.012 + progress * 0.018})`
      : `rgba(110,127,215,${0.016 + progress * 0.018})`
    ctx.fillRect(x, y, width, h)
  }

  for (let i = 0; i < 70 + progress * 120; i += 1) {
    const x = Math.random() * width
    const y = Math.random() * height
    const alpha = Math.random() * (0.014 + progress * 0.024)
    ctx.fillStyle = Math.random() > 0.94
      ? `rgba(139,46,63,${alpha * 0.78})`
      : `rgba(91,108,255,${alpha})`
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1)
  }

  const vignette = ctx.createRadialGradient(width * 0.47, height * 0.48, width * 0.08, width * 0.5, height * 0.5, width * 0.72)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(0.48, `rgba(0,0,0,${0.08 + progress * 0.1})`)
  vignette.addColorStop(0.74, `rgba(0,0,0,${0.34 + progress * 0.16})`)
  vignette.addColorStop(1, `rgba(0,0,0,${0.92 + progress * 0.05})`)
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
          'radial-gradient(circle at 48% 48%, rgba(91,108,255,0.06), transparent 28%), #05070B',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          background:
            'repeating-linear-gradient(92deg,rgba(91,108,255,0.15) 0,rgba(91,108,255,0.15) 2px,transparent 2px,transparent 44px),' +
            'repeating-linear-gradient(4deg,rgba(139,46,63,0.09) 0,rgba(139,46,63,0.09) 2px,transparent 2px,transparent 43px)',
          opacity: 0.54,
          filter: 'blur(0.75px) drop-shadow(0 0 6px rgba(110,127,215,0.2))',
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
    renderer.setClearColor(BACKGROUND)

    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault()
        setWebglFailed(true)
      },
      { once: true },
    )

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(BACKGROUND)
    scene.fog = new THREE.FogExp2(0x0b1020, 0.021)

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 140)
    camera.position.set(0, 0, 1.2)

    const roomGroup = new THREE.Group()
    scene.add(roomGroup)

    const dataTextures = [
      createTerminalDataTexture('blue'),
      createTerminalDataTexture('white'),
      createTerminalDataTexture('red'),
    ]
    const matCore = createDataWallMaterial(dataTextures[0], PHOSPHOR_BLUE, SIGNAL_CRIMSON, 0.76, 1)
    const matBloom = createDataWallMaterial(dataTextures[1], PHOSPHOR_SOFT, SIGNAL_RED, 0.3, 1.42)
    const matBleed = createDataWallMaterial(dataTextures[2], SIGNAL_RED, SIGNAL_CRIMSON, 0.08, 1.85)
    const tunnelMaterials = [matCore, matBloom, matBleed]
    const geometries = [
      new THREE.CylinderGeometry(TUNNEL_RADIUS, TUNNEL_RADIUS * 0.68, L, 192, 128, true),
      new THREE.CylinderGeometry(TUNNEL_RADIUS * 0.99, TUNNEL_RADIUS * 0.67, L, 192, 128, true),
      new THREE.CylinderGeometry(TUNNEL_RADIUS * 0.965, TUNNEL_RADIUS * 0.66, L, 192, 128, true),
    ]

    geometries.forEach((geometry, index) => {
      geometry.rotateX(Math.PI / 2)
      geometry.translate(0, 0, -L / 2)
      const wall = new THREE.Mesh(geometry, tunnelMaterials[index])
      wall.frustumCulled = false
      wall.renderOrder = index
      roomGroup.add(wall)
    })

    const hazeGeometry = new THREE.SphereGeometry(1, 24, 12)
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: HAZE,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial)
    haze.scale.set(8.4, 8.4, 31)
    haze.position.set(0, 0, -36)
    scene.add(haze)

    const entity = createSignalEntity(character03Url, character04Url)
    entity.group.position.set(-0.42, -0.5, -2.8)
    entity.group.scale.setScalar(1.62)
    scene.add(entity.group)

    const pointLight = new THREE.PointLight(PHOSPHOR_SOFT, 0.42, 24)
    scene.add(pointLight)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.15, 0.96, 0.42),
    )

    let targetZ = 0
    let currentZ = 0
    let rafId = 0
    let startTime = 0

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
      if (startTime === 0) startTime = time
      const elapsed = Math.max(0, time - startTime)

      currentZ += (targetZ - currentZ) * 0.042
      const progress = clamp01(-currentZ / Math.abs(CAM_Z_MIN))
      const attack = smoothstep(0.04, 1, progress)
      const absorb = easeInOutSine(attack)
      const transformProgress = smoothstep(2600, 6800, elapsed)
      const gravityPull = smoothstep(0.18, 1, transformProgress)
      const sequencePull = clamp01(absorb + gravityPull * 0.46)
      const distortion = 0.18 + absorb * 0.5 + gravityPull * 0.35
      const tearGate = Math.sin(time * 0.011 + gravityPull * 1.7) > 0.975 - gravityPull * 0.018 ? 1 : 0

      camera.fov = 68 - sequencePull * 2.7 + Math.sin(time * 0.00045) * 0.18
      camera.updateProjectionMatrix()
      camera.position.set(
        Math.sin(time * 0.00028) * 0.035,
        Math.cos(time * 0.00025) * 0.028,
        currentZ + 1.2,
      )
      camera.rotation.set(
        Math.sin(time * 0.00022) * 0.0025,
        Math.cos(time * 0.0002) * 0.002,
        Math.sin(time * 0.00032) * 0.0035,
      )
      camera.lookAt(
        Math.sin(time * 0.00032) * 0.055,
        Math.cos(time * 0.00029) * 0.045,
        currentZ - 22 - sequencePull * 12,
      )

      roomGroup.position.set(
        Math.sin(time * 0.00055) * 0.012 * distortion,
        Math.cos(time * 0.0005) * 0.01 * distortion,
        (time * (0.00018 + gravityPull * 0.00022) + sequencePull * 0.42) % CELL,
      )
      roomGroup.rotation.set(
        Math.sin(time * 0.00022) * 0.003,
        Math.cos(time * 0.0002) * 0.0025,
        time * (0.000045 + gravityPull * 0.000055) + sequencePull * 0.22,
      )
      roomGroup.scale.setScalar(1 + sequencePull * 0.025 - gravityPull * 0.018)

      const depthPull = Math.pow(sequencePull, 0.78)
      const scalePull = Math.pow(sequencePull, 1.12)
      const visibilityLoss = Math.pow(sequencePull, 3.2)
      const drift = Math.sin(time * 0.00046) * 0.11 + Math.sin(time * 0.00017 + 1.7) * 0.07
      const entityDistance = THREE.MathUtils.lerp(3.8, 21.5, depthPull)
      const entityZ = currentZ + 1.2 - entityDistance
      entity.group.position.set(
        THREE.MathUtils.lerp(-0.42, 0.0, depthPull) + drift * (0.45 - depthPull * 0.38) + tearGate * 0.014,
        THREE.MathUtils.lerp(-0.5, 0.0, depthPull) + Math.cos(time * 0.00038) * (0.055 - depthPull * 0.04),
        entityZ,
      )
      entity.group.rotation.set(
        Math.sin(time * 0.00045) * 0.035 + gravityPull * 0.16,
        THREE.MathUtils.lerp(-0.16, 0.04, sequencePull) + Math.cos(time * 0.00036) * (0.04 + gravityPull * 0.04),
        THREE.MathUtils.lerp(-0.035, 0.12, gravityPull) + Math.sin(time * 0.00041) * (0.022 + gravityPull * 0.035),
      )
      const entityScale = THREE.MathUtils.lerp(1.72, 0.08, scalePull)
      entity.group.scale.set(
        entityScale * (1 - gravityPull * 0.12),
        entityScale * (1 + gravityPull * 0.26),
        entityScale,
      )
      const phaseDrop = Math.sin(time * (0.00125 + gravityPull * 0.0009)) > 0.992 ? 0.58 : 1
      entity.group.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          const baseX = index === 0 ? 0 : index === 1 ? -0.18 : 0.2
          const trailLag = index * 0.16 * gravityPull
          const baseOpacity = index === 0
            ? THREE.MathUtils.lerp(0.25, 0.048, visibilityLoss)
            : THREE.MathUtils.lerp(0.055, 0.014, visibilityLoss)
          child.position.x = baseX + Math.sin(time * 0.0014 + index * 2.4) * 0.035 * distortion - trailLag
          child.position.z = -0.05 * index + gravityPull * (index + 1) * 0.22
          child.scale.set(
            1.015 + index * 0.025 - gravityPull * 0.09,
            1.01 + index * 0.02 + gravityPull * (0.12 + index * 0.05),
            1,
          )
          child.material.uniforms.time.value = time
          child.material.uniforms.progress.value = sequencePull
          child.material.uniforms.transform.value = transformProgress
          child.material.uniforms.pull.value = gravityPull
          child.material.uniforms.opacity.value = baseOpacity * phaseDrop
          child.material.uniforms.split.value = 0.001 + sequencePull * 0.0028 + gravityPull * 0.0018
          child.material.uniforms.tear.value = tearGate * (0.18 + sequencePull * 0.28 + gravityPull * 0.22)
        }
      })

      const warningPulse = smoothstep(0.72, 1, gravityPull) * (0.5 + Math.sin(time * 0.0028) * 0.5)
      matCore.uniforms.time.value = time
      matBloom.uniforms.time.value = time
      matBleed.uniforms.time.value = time
      matCore.uniforms.pull.value = gravityPull
      matBloom.uniforms.pull.value = gravityPull
      matBleed.uniforms.pull.value = gravityPull
      matCore.uniforms.opacity.value = 0.7 + Math.sin(time * 0.004) * 0.018 - sequencePull * 0.06 + gravityPull * 0.03
      matBloom.uniforms.opacity.value = 0.24 + sequencePull * 0.04 + gravityPull * 0.028 + Math.sin(time * 0.006) * 0.012
      matBleed.uniforms.opacity.value = 0.035 + sequencePull * 0.012 + warningPulse * 0.05 + tearGate * 0.01
      hazeMaterial.opacity = 0.042 + sequencePull * 0.052 + gravityPull * 0.032
      pointLight.position.set(0, 0, currentZ - 10 - gravityPull * 5)
      pointLight.intensity = 0.34 + sequencePull * 0.2 + gravityPull * 0.12

      const controlOpacity = smoothstep(0.9, 1, progress)
      document.documentElement.style.setProperty('--control-room-opacity', String(controlOpacity))
      canvas.style.filter = `blur(${0.2 + gravityPull * 0.16}px) contrast(${0.92 + sequencePull * 0.04}) brightness(${0.5 - sequencePull * 0.06}) saturate(${0.7 + warningPulse * 0.06})`
      canvas.style.transform = `translate(${Math.sin(time * 0.0016) * 0.06 * distortion}px, ${Math.cos(time * 0.0012) * 0.055 * distortion}px) scale(${1 + sequencePull * 0.004 + gravityPull * 0.004})`
      overlay.style.opacity = String(0.36 + sequencePull * 0.1 + gravityPull * 0.06)

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
      entity.nextTexture.dispose()
      entity.geometry.dispose()
      entity.group.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.dispose()
        }
      })
      dataTextures.forEach((texture) => texture.dispose())
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
              background: '#05070B',
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
