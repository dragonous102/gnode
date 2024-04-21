import { useRef, Suspense, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useLoader, extend, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, useTexture, GradientTexture, Environment, Stars, Preload, Html, Line, Image, useScroll, Billboard, Text } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { planets } from "../planets";
import * as THREE from "three";
import { suspend } from 'suspend-react'
// import { generate } from 'random-words'
import { easing, geometry } from 'maath'
import { Bloom, EffectComposer } from "@react-three/postprocessing";

import { DissolveMaterial } from "./DissolveMaterial";
import { isPointVisible } from "../utils";

function Planet({ planet, idx }) {
  const texture = useLoader(TextureLoader, `/textures/${planet.name}.jpeg`);
  const ref = useRef();
  const isSun = planet.name === "Sun";
  const random = Math.random() * 2 - 1;
  useFrame((t) => {
    ref.current.rotation.y += 0.01;
    if (!isSun) {
      ref.current.position.x =
        Math.cos(t.clock.elapsedTime * random) * (1 + idx);
      ref.current.position.z =
        Math.sin(t.clock.elapsedTime * Math.abs(random)) * (1 + idx);
      ref.current.position.y =
        Math.sin(t.clock.elapsedTime * random) * (1 + idx);
    }
  });
  return (
    <mesh
      position={[planet.name === "Sun" ? 0 : 1 + idx, 0, 0]}
      scale={planet.scale}
      ref={ref}
    >
      <sphereGeometry attach="geometry" args={[0.5, 32, 32]} />
      {isSun ? (
        <meshBasicMaterial map={texture} attach="material" />
      ) : (
        <meshStandardMaterial attach="material" map={texture} />
      )}
      {/* <Html className="planet-name">{planet.name}</Html> */}
    </mesh>
  );
}


function SolarSystem({ rotation, scale, ...props }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const { camera } = useThree();
  const [visible, setVisible] = useState(false);

  const texture = useTexture(`/textures/universe1.jpg`)
  const material = new THREE.MeshStandardMaterial({
    map: texture // This applies the texture as the color map
  });
  useFrame((state, delta) => {
    const distance = ref.current.position.distanceTo(camera.position);
    let visibilityThreshold = 30
    // const shouldBeVisible = distance <= visibilityThreshold;
    const shouldBeVisible = isPointVisible(ref.current.position, camera.position);
    setVisible(shouldBeVisible);

    // easing.damp(ref.current.material, 'distort', hovered ? 0.5 : 0, 0.25, delta)
    easing.damp(ref.current.material, 'speed', hovered ? 4 : 0, 0.25, delta)
    easing.dampE(ref.current.rotation, clicked ? [0, Math.PI * 3 / 2, 0] : rotation, 0.5, delta)
    easing.damp3(ref.current.scale, clicked ? 8 : shouldBeVisible ? scale : 0, 0.25, delta)
    // easing.dampC(ref.current.material.color, hovered ? '#ef2060' : 'white', 0.25, delta)

  })
  return (
    <mesh {...props} ref={ref}
      onPointerOver={(e) => (e.stopPropagation(), hover(true))}
      onPointerOut={(e) => (e.stopPropagation(), hover(false))}
      onClick={(e) => (e.stopPropagation(), click(!clicked))}
    >
      <planeGeometry args={[1, 0.8, 64, 64]} />
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
      <group scale={0.04}>
        {planets?.map((planet, idx) => (
          <Planet planet={planet} key={idx} idx={idx} />
        ))}
      </group>
    </mesh>
  )
}

export default SolarSystem;
