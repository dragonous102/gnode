import { useRef, Suspense, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useLoader, extend, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, useProgress, useTexture, Outlines, Stars, Preload, Html, Line, Image, useScroll, Billboard, Text } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";
import Road from "./Components/Road";
import { easing, geometry } from 'maath'
import { useSDK } from '@metamask/sdk-react';

import { findClosestPoint, calculateFigureEightPoints } from "./utils";
import Card from "./Components/Card";
import SolarSystem from './Components/SolarSystem'
import Torus from "./Components/Torus/Torus";
import Mount from "./Components/Mount"
import Arrow from "./Components/Arrow"


function App() {
  const [hovered, hover] = useState(null)
  const { progress } = useProgress();
  const [clicked, setClicked] = useState(null)
  const [account, setAccount] = useState("");
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const connect = async () => {
    try {
      if (connected) {
        sdk?.disconnect();
      } else {
        const accounts = await sdk?.connect();
        setAccount(accounts?.[0]);
      }

    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };

  return (
    <>
      <div className="btn_div">
        <button className="connect_btn" onClick={connect}>
          {connected ? "Disconnect" : "Connect"}
        </button>
        {connected && (
          <div className="info_div">
            <>
              {chainId && `Connected chain: ${chainId}`}
              <p></p>
              {account && `Connected account: ${account}`}
            </>
          </div>
        )}
      </div>

      <Canvas style={{ position: "absolute" }}>

        <ambientLight intensity={0.8} />
        <color attach="background" args={["#ddfdff"]} />
        <ScrollControls pages={15} infinite>
          <Scene position={[0, 0, 0]} onPointerOver={hover} onPointerOut={hover} clicked={clicked} setClicked={setClicked} />
        </ScrollControls>
        <Preload all />
      </Canvas>
      {
        clicked && <section className="scene__project project is-left is-project" data-scene-project="">
          <div className="project__overlay">
            <div className="project__back" onClick={() => setClicked(false)}>
              <div className="project__back-cta t-cta" >BACK</div>
              <div class="project__back-circle"></div>
            </div>
            <div className="project__outer">
              <div className="project__container">
                <div className="project__content">
                  <h2 className="project__title">Soloar System</h2>
                </div>
              </div>
            </div>

          </div>
        </section>
      }

    </>

  );
}

function Scene({ children, onPointerOver, onPointerOut, clicked, setClicked, ...props }) {
  const ref = useRef()
  const scroll = useScroll()
  const { camera } = useThree();
  const scrollData = useScroll();
  const [objPos, setObjPos] = useState([0, 0, 0])
  const [angle, setAngle] = useState([0, 0, 0])
  let radius = 50; // radius of each lobe of the eight
  let numPoints = 100000; // number of points to calculate

  let points = calculateFigureEightPoints(radius, 0, numPoints);
  points.push(points[0]);
  const rot = camera.rotation;
  useFrame((state, delta) => {

    if (clicked) {
      const distanceToCam = -15;
      const euler = new THREE.Euler(angle[0], angle[1], angle[2]);
      const directionVector = new THREE.Vector3(0, 0, -1); // Forward direction for cameras in Three.js is along negative Z

      // Apply the rotation to direction vector
      directionVector.applyEuler(euler);

      // Normalize the direction vector just to be safe, though it should already be unit length
      directionVector.normalize();
      const objPosVec = new THREE.Vector3(objPos[0], objPos[1], objPos[2])
      // Calculate the new position by scaling the direction vector by the distance and adding it to the original position
      const newPos = objPosVec.clone().add(directionVector.multiplyScalar(distanceToCam));

      // Logging the result
      camera.position.copy(newPos);
      easing.dampE(camera.rotation, [angle[0], angle[1] + 0.3, angle[2]], 0.5, delta)

      // easing.damp3(state.camera.position, newPos, 0.3, delta) // Move camera
      // easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9], 0.3, delta)

      // camera.lookAt(objPos.x, objPos.y + 2, objPos.z + 5); // Adjust as needed

      // return
    } else {

      // const nextPoint = getNextPoint();
      let offset = scroll.offset
      offset = Math.abs(offset)
      const totalSegments = points.length - 1; // Number of line segments in the path
      const segFraction = 1 / totalSegments; // Fractional size of one segment's scroll range
      let segIdx = Math.min(Math.floor(offset * totalSegments), totalSegments - 1); // Current segment index

      // Calculate local alpha for interpolation within the current segment
      const localOffset = Math.max(0, Math.min(1, (offset - (segIdx * segFraction)) / segFraction));

      const easeOutQuad = t => t * (2 - t);
      // Use the easing function on the localT
      const smoothedT = easeOutQuad(localOffset);
      let newCameraPosition;
      let idx = Math.abs(segIdx)
      if (idx == totalSegments - 1) {

        // newCameraPosition = points[0]
        newCameraPosition = new THREE.Vector3().lerpVectors(
          points[idx],     // Start vector of the current segment
          points[0], // End vector of the next segment
          smoothedT         // Local alpha (progress within current segment)
        );
        let newPos = new THREE.Vector3(newCameraPosition.x, newCameraPosition.y + 1, newCameraPosition.z)
        camera.position.copy(newPos);
        camera.lookAt(points[1].x, points[1].y + 2, points[1].z); // Adjust as needed
      }
      else {
        newCameraPosition = points[idx + 1]
        newCameraPosition = new THREE.Vector3().lerpVectors(
          points[idx],     // Start vector of the current segment
          points[idx + 1], // End vector of the next segment
          smoothedT         // Local alpha (progress within current segment)
        );
        let newPos = new THREE.Vector3(newCameraPosition.x, newCameraPosition.y + 2, newCameraPosition.z)
        camera.position.copy(newPos);
        camera.lookAt(points[idx + 2].x, points[idx + 2].y + 2, points[idx + 2].z); // Adjust as needed
      }
    }
  })
  return (
    <group ref={ref}>

      <Road />
      <Torus position={[35, 2.5, 25]}></Torus>
      <Mount position={[-30, 1, 12]} scale={0.4} rotation={[0, -2, 0]}></Mount>
      <Arrow
        position={[-25, 1.5, -15]}
        rotation={[-0.6, 0.3, 0]}
      />

      <Card
        url={`/textures/project4.jpg`}
        position={[40, 2, -30]}
        rotation={[0, -0.5, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
      <Html transform portal={{ current: scrollData.fixed }} position={[40, 2, -25]} rotation={[0, -1.5, 0]}>
        <div className="content" >
          History of Acient
        </div>
      </Html>

      <Card
        url={`/textures/galaxy1.jpg`}
        position={[5, 5, 25]}
        rotation={[0, 1.5, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
      <Html transform portal={{ current: scrollData.fixed }} position={[5, 5, 20]} rotation={[0, 1.5, 0]}>
        <div className="content" >
          Universe
        </div>
      </Html>

      <Card
        url={`/textures/download.jpg`}
        position={[-2, 5, -22]}
        rotation={[0, 0.5, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
      <Card
        url={`/textures/project2.jpg`}
        position={[-30, 5, -30]}
        rotation={[0, 0.8, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
      <Card
        url={`/textures/images.jpg`}
        position={[-60, 4, -10]}
        rotation={[0, 2, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
      <Card
        url={`/textures/project3.jpg`}
        position={[-50, 3, 30]}
        rotation={[0, 3.14, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />

      <Card
        url={`/textures/project3.jpg`}
        position={[-50, 3, 30]}
        rotation={[0, 3.14, 0]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />

      <SolarSystem
        rotation={[0, Math.PI * 3 / 2, 0]}
        position={[-25, 2, 25]}
        scale={[6, 5, 2]}
        setClicked={setClicked}
        clicked={clicked}
        setObjPos={setObjPos}
        setAngle={setAngle}
      />
    </group>
  )
}


export default App;
