import { useRef, Suspense, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useLoader, extend, useFrame, useThree } from "@react-three/fiber";
import { useScroll, Html, MeshDistortMaterial, useTexture } from "@react-three/drei";
import { easing, geometry } from 'maath'
import { useSpring, animated } from '@react-spring/three';
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Experience } from "./Experience";
// import ParticleComponent from "./Particle"
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { useControls } from "leva";
import { DissolveMaterial } from "./DissolveMaterial";
import * as THREE from "three";
import { isPointVisible } from "../utils"

let visibilityThreshold = 20; // Adjust this for your desired distance

function Card({ url, active, rotation, ...props }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const texture = useTexture(url)
  const { camera } = useThree();
  const [visible, setVisible] = useState(false);


  const { scale, opacity } = useSpring({
    scale: !visible ? [0, 0, 0] : [1, 1, 1], // disappear to 0 or appear to normal size
    opacity: !visible ? 0 : 1, // fade out to 0 or fade in to 1
    config: { mass: 5, tension: 400, friction: 50 }, // Customize spring physics
  });
  useFrame((state, delta) => {
    const distance = ref.current.position.distanceTo(camera.position);
    visibilityThreshold = 40
    // const shouldBeVisible = distance <= visibilityThreshold;
    const shouldBeVisible = isPointVisible(ref.current.position, camera.position);

    setVisible(shouldBeVisible);

    //  ref.current.visible = shouldBeVisible


    easing.damp(ref.current.material, 'distort', hovered ? 0.5 : 0.5, 0.25, delta)
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
        onClick={(e) => (e.stopPropagation(), click(!clicked))}
      >

        <planeGeometry {...animProps} args={[1, 0.8, 32, 32]} />

        {hovered ? <MeshDistortMaterial map={texture} speed={2} toneMapped={true} /> :
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