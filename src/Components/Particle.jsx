import * as THREE from 'three'
import ReactDOM from 'react-dom'
import React, { Suspense, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import lerp from 'lerp'
import * as meshline from 'threejs-meshline'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'


// import { GlitchPass } from './Glitchpass'
// import { WaterPass } from './Waterpass'
// import Text from './Text'

// Makes these prototypes available as "native" jsx-string elements
extend({ EffectComposer, RenderPass, UnrealBloomPass, FilmPass })
extend(meshline)

function Fatline({ curve, width, color, speed }) {
  const material = useRef()
  useFrame(() => (material.current.uniforms.dashOffset.value -= speed))
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial attach="material" ref={material} transparent depthTest={false} lineWidth={width} color={color} dashArray={0.1} dashRatio={0.95} />
    </mesh>
  )
}

function r() {
  return Math.max(0.5, Math.random())
}

function Lines({ mouse, count, colors, radius = 15 }) {
  const lines = useMemo(
    () =>
      new Array(count).fill().map(() => {
        const pos = new THREE.Vector3(Math.sin(0) * radius * r(), Math.cos(0) * radius * r(), 0)
        const points = new Array(30).fill().map((_, index) => {
          const angle = (index / 20) * Math.PI * 2
          return pos.add(new THREE.Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r(), 0)).clone()
        })
        const curve = new THREE.CatmullRomCurve3(points).getPoints(1000)
        return {
          color: colors[parseInt(colors.length * Math.random())],
          width: 0.1,
          speed: Math.max(0.0005, 0.001 * Math.random()),
          curve
        }
      }),
    [count]
  )

  const ref = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  useFrame(state => {
    if (ref.current) {
      ref.current.rotation.x = lerp(ref.current.rotation.x, 0 + mouse.current[1] / aspect / 50, 0.1)
      ref.current.rotation.y = lerp(ref.current.rotation.y, 0 + mouse.current[0] / aspect / 100, 0.1)
    }
  })

  return (
    <group ref={ref}>
      <group position={[-radius * 2, -radius, 0]}>
        {lines.map((props, index) => (
          <Fatline key={index} {...props} />
        ))}
      </group>
    </group>
  )
}

function Swarm({ count, mouse }) {
  const mesh = useRef()
  const light = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])
  // The innards of this hook will run every frame
  useFrame(state => {
    // Makes the light follow the mouse
    light.current.position.set(mouse.current[0] / aspect, -mouse.current[1] / aspect, 0)
    // Run through the randomized data to calculate some movement
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      // There is no sense or reason to any of this, just messing around with trigonometric functions
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += (mouse.current[0] - particle.mx) * 0.01
      particle.my += (mouse.current[1] * -1 - particle.my) * 0.01
      // Update the dummy object
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <planeGeometry args={[0.8, 0.8, 32, 32]} />
        <meshPhongMaterial attach="material" color="#050505" />
      </instancedMesh>
    </>
  )
}

function Effect() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  // useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // useFrame(() => composer.current.render(), 1)
  return (
    <>
    </>
    // // <effectComposer ref={composer} args={[gl]}>
    //   {/* <renderPass attachArray="passes" scene={scene} camera={camera} /> */}
    //   {/* <waterPass attachArray="passes" factor={1.5} /> */}
    //   {/* <unrealBloomPass attachArray="passes" args={[aspect, 2, 1, 0]} /> */}
    //   {/* <glitchPass attachArray="passes" factor={down ? 1 : 0} /> */}
    // {/* </effectComposer> */}
  )
}


export default function App() {
  const mouse = useRef([0, 0])
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)


  return (
    <>
        <fog attach="fog" args={['white', 50, 190]} />
        <pointLight distance={100} intensity={4} color="white" />
        <Swarm count={isMobile ? 5000 : 10000} mouse={mouse} />
        {/* <Lines count={10} mouse={mouse} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} /> */}
        <Effect />
    </>
  )
}

