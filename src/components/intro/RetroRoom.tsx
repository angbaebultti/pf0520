import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GRID_STEP = 4.6
const ROOM_WIDTH = 34
const ROOM_HEIGHT = 24
const ROOM_FRONT_Z = 12
const ROOM_BACK_Z = -200
const ROOM_DEPTH = ROOM_FRONT_Z - ROOM_BACK_Z
const ROOM_CENTER_Z = (ROOM_FRONT_Z + ROOM_BACK_Z) / 2

function makeGridGeometry(width: number, height: number, step: number) {
  const vertices: number[] = []
  const halfWidth = width / 2
  const halfHeight = height / 2

  for (let x = -halfWidth; x <= halfWidth + 0.001; x += step) {
    vertices.push(x, -halfHeight, 0, x, halfHeight, 0)
  }

  for (let y = -halfHeight; y <= halfHeight + 0.001; y += step) {
    vertices.push(-halfWidth, y, 0, halfWidth, y, 0)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  return geometry
}

function makeLineMaterial(color: number, opacity: number) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
}

function RoomFaces({
  floorGeometry,
  wallGeometry,
  material,
  offset = [0, 0, 0],
}: {
  floorGeometry: THREE.BufferGeometry
  wallGeometry: THREE.BufferGeometry
  material: THREE.LineBasicMaterial
  offset?: [number, number, number]
}) {
  return (
    <group position={offset}>
      <lineSegments
        geometry={floorGeometry}
        material={material}
        position={[0, 0, ROOM_CENTER_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <lineSegments
        geometry={floorGeometry}
        material={material}
        position={[0, ROOM_HEIGHT, ROOM_CENTER_Z]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <lineSegments
        geometry={wallGeometry}
        material={material}
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, ROOM_CENTER_Z]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <lineSegments
        geometry={wallGeometry}
        material={material}
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, ROOM_CENTER_Z]}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  )
}

interface RetroRoomProps {
  scrollProgressRef?: MutableRefObject<number>
}

export default function RetroRoom({ scrollProgressRef }: RetroRoomProps) {
  const tunnelRef = useRef<THREE.Group>(null)
  const {
    floorGeometry,
    wallGeometry,
    coreMaterial,
    glowMaterial,
    bloomMaterial,
    redMaterial,
    cyanMaterial,
    amberMaterial,
  } = useMemo(() => {
    return {
      floorGeometry: makeGridGeometry(ROOM_WIDTH, ROOM_DEPTH, GRID_STEP),
      wallGeometry: makeGridGeometry(ROOM_DEPTH, ROOM_HEIGHT, GRID_STEP),
      coreMaterial: makeLineMaterial(0xffffff, 1),
      glowMaterial: makeLineMaterial(0xff86df, 0.24),
      bloomMaterial: makeLineMaterial(0x8a70ff, 0.09),
      redMaterial: makeLineMaterial(0xff4fbc, 0.11),
      cyanMaterial: makeLineMaterial(0x54e8ff, 0.12),
      amberMaterial: makeLineMaterial(0xffb468, 0.14),
    }
  }, [])

  useFrame(() => {
    const progress = scrollProgressRef?.current ?? 0

    if (tunnelRef.current) {
      tunnelRef.current.position.z = (progress * 82) % GRID_STEP
      tunnelRef.current.scale.setScalar(1 + progress * 0.035)
    }

    coreMaterial.opacity = 0.6 + progress * 0.4
    glowMaterial.opacity = 0.18 + progress * 0.28
    bloomMaterial.opacity = 0.06 + progress * 0.18
    amberMaterial.opacity = 0.1 + progress * 0.18
    redMaterial.opacity = 0.08 + progress * 0.14
    cyanMaterial.opacity = 0.09 + progress * 0.16
  })

  return (
    <group ref={tunnelRef}>
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={bloomMaterial}
        offset={[0.18, -0.09, 0]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={bloomMaterial}
        offset={[-0.18, 0.09, 0]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={bloomMaterial}
        offset={[0, 0, 0.18]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={glowMaterial}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={amberMaterial}
        offset={[0, 0.055, 0.035]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={redMaterial}
        offset={[-0.065, 0.026, 0]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={cyanMaterial}
        offset={[0.065, -0.026, 0]}
      />
      <RoomFaces
        floorGeometry={floorGeometry}
        wallGeometry={wallGeometry}
        material={coreMaterial}
      />
    </group>
  )
}
