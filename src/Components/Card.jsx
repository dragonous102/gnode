import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, useTexture } from "@react-three/drei";
import { easing } from 'maath'
import { useSpring, animated } from '@react-spring/three';
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
import { DissolveMaterial } from "./DissolveMaterial";
import * as THREE from "three";
import { isPointVisible } from "../utils"


function Card({ url, active, clicked, setClicked, setObjPos, setAngle, rotation, ...props }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const texture = useTexture(url)
  const { camera } = useThree();
  const [visible, setVisible] = useState(false);


  useFrame((state, delta) => {
    const shouldBeVisible = isPointVisible(ref.current.position, camera.position);
    setVisible(shouldBeVisible);

    easing.damp(ref.current.material, 'distort', hovered ? 0.3 : 0.3, 0.25, delta)
    easing.damp(ref.current.material, 'speed', hovered ? 4 : 0, 0.25, delta)
    easing.dampE(ref.current.rotation, rotation, 0.5, delta)
    easing.damp3(ref.current.scale, clicked ? 15 : 8, 0.25, delta)
    easing.dampC(ref.current.material.color, hovered ? '#fff' : 'white', 0.25, delta)

  })
  const animProps = useSpring({
    from: { scale: [0, 0, 0], opacity: 0 },
    to: { scale: [1, 1, 1], opacity: 1 },
    delay: 1000
  });
  const material = new THREE.MeshStandardMaterial({
    map: texture // This applies the texture as the color map
  });
  return (
    <>
      <animated.mesh
        ref={ref} {...props}
        {...animProps}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={(e) => (e.stopPropagation(), hover(false))}
        onClick={(e) => (e.stopPropagation(), setClicked(!clicked), setObjPos(props.position), setAngle(rotation))}
      >

        <planeGeometry args={[1, 0.7, 32, 32]} />

        {hovered && visible ? <MeshDistortMaterial map={texture} speed={2} toneMapped={true} /> :
          <DissolveMaterial
            baseMaterial={material}
            visible={visible}
            color="#7f532f"
            duration={0.6}
          >
          </DissolveMaterial>
        }

        <Environment preset="sunset" />
        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={1.25} mipmapBlur />
        </EffectComposer>

      </animated.mesh>
    </>


  )
}

export default Card;