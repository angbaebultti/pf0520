import SceneCanvas from './SceneCanvas'

interface Props {
  isEmerging?: boolean
}

export default function SpaceScene({ isEmerging = false }: Props) {
  return <SceneCanvas isEmerging={isEmerging} />
}
