import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Rays } from './Rays'

function Torus(props) {
  const mesh = useRef()
  const sphere = useRef()
  useFrame((state, delta) => (mesh.current.rotation.x = mesh.current.rotation.y += delta))
  return (
    <mesh
      ref={mesh}
      {...props}
      onPointerMove={(e) => sphere.current.position.copy(mesh.current.worldToLocal(e.point))}
      onPointerOver={() => (sphere.current.visible = true)}
      onPointerOut={() => (sphere.current.visible = false)}>
      <torusKnotGeometry args={[1, 0.4, 200, 50]} />
      <meshNormalMaterial />
      <mesh raycast={() => null} ref={sphere} visible={false}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="orange" toneMapped={false} />
      </mesh>
    </mesh>
  )
}

export default function App({ ...props }) {
  return (
    <>
      {/** Anything that Bvh wraps is getting three-mesh-bvh's acceleratedRaycast.
           Click on "enabled" to see what normal raycast performance in threejs looks like. */}
      <Rays {...props} >
        <Torus />
      </Rays>
    </>
  )
}
