import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import onlyCloudUrl from '../../assets/only_cloud.png'

const LEFT_BASE_SCALE: [number, number, number] = [20, 27, 1]
const RIGHT_BASE_SCALE: [number, number, number] = [20, 27, 1]
const CAMERA_START_Z = 8
const CAMERA_TRAVEL_Z = 60
const CLOUD_CAMERA_OFFSET_Z = -10

interface CloudClusterProps {
  scrollProgressRef?: MutableRefObject<number>
}

export default function CloudCluster({ scrollProgressRef }: CloudClusterProps) {
  const leftCloudRef = useRef<THREE.Mesh>(null)
  const rightCloudRef = useRef<THREE.Mesh>(null)
  const cloudTexture = useLoader(THREE.TextureLoader, onlyCloudUrl)

  const { leftTexture, rightTexture } = useMemo(() => {
    const makeSideTexture = (offsetX: number) => {
      const texture = cloudTexture.clone()
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = false
      texture.offset.set(offsetX, 0)
      texture.repeat.set(0.5, 1)
      texture.needsUpdate = true
      return texture
    }

    return {
      leftTexture: makeSideTexture(0),
      rightTexture: makeSideTexture(0.5),
    }
  }, [cloudTexture])

  useFrame(() => {
    const progress = scrollProgressRef?.current ?? 0
    const grow = 1 + progress * 0.5
    const cameraZ = CAMERA_START_Z - progress * CAMERA_TRAVEL_Z
    const cloudZ = cameraZ + CLOUD_CAMERA_OFFSET_Z

    if (leftCloudRef.current) {
      leftCloudRef.current.position.z = cloudZ
      leftCloudRef.current.scale.set(
        LEFT_BASE_SCALE[0] * grow,
        LEFT_BASE_SCALE[1] * grow,
        LEFT_BASE_SCALE[2]
      )
    }

    if (rightCloudRef.current) {
      rightCloudRef.current.position.z = cloudZ
      rightCloudRef.current.scale.set(
        RIGHT_BASE_SCALE[0] * grow,
        RIGHT_BASE_SCALE[1] * grow,
        RIGHT_BASE_SCALE[2]
      )
    }
  })

  return (
    <group renderOrder={30}>
      <mesh ref={leftCloudRef} position={[-10, 6.5, -9]} scale={LEFT_BASE_SCALE} renderOrder={31}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={leftTexture}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={rightCloudRef}
        position={[10, 6.8, -11]}
        scale={RIGHT_BASE_SCALE}
        renderOrder={32}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={rightTexture}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
