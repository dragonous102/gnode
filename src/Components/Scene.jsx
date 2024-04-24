import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { easing } from 'maath'
import { calculateFigureEightPoints } from "../utils";
import Road from "./Road";
import Card from "./Card";
import SolarSystem from './SolarSystem'
import Torus from "./Torus/Torus";
import Mount from "./Mount"
import Arrow from "./Arrow"

function Scene({ children, clicked, setClicked, ...props }) {
    const ref = useRef()
    const scroll = useScroll()
    const { camera } = useThree();
    const scrollData = useScroll();
    const [objPos, setObjPos] = useState([0, 0, 0])
    const [angle, setAngle] = useState([0, 0, 0])
    let radius = 50; // radius of each lobe of the eight
    let numPoints = 50000; // number of points to calculate

    let points = calculateFigureEightPoints(radius, 0, numPoints);
    // points.push(points[0]);
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

        } else {

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
                    points[idx + 1], // End vector of the next segment
                    smoothedT         // Local alpha (progress within current segment)
                );
                let newPos = new THREE.Vector3(newCameraPosition.x, newCameraPosition.y + 2, newCameraPosition.z)
                camera.position.copy(newPos);
                camera.lookAt(points[0].x, points[0].y + 2, points[0].z); // Adjust as needed
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
            <Torus position={[35, 1, 20]}></Torus>
            <Mount position={[-30, 1, 12]} scale={0.4} rotation={[0, -2, 0]}></Mount>
            <Arrow
                position={[-25, 0.5, -15]}
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
            <Html transform portal={{ current: scrollData.fixed }} position={[45, 2, -30]} rotation={[0, -1.5, 0]}>
                <div className="content" >
                    History of Acient
                </div>
            </Html>

            <Card
                url={`/textures/galaxy1.jpg`}
                position={[5, 2, 25]}
                rotation={[0, 1.5, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />
            <Html transform portal={{ current: scrollData.fixed }} position={[2, 2, 21]} rotation={[0, 1.5, 0]}>
                <div className="content" >
                    Universe
                </div>
            </Html>

            <Card
                url={`/textures/download.jpg`}
                position={[-2, 2, -22]}
                rotation={[0, 0.5, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />
            <Card
                url={`/textures/project2.jpg`}
                position={[-30, 2, -30]}
                rotation={[0, 0.8, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />
            <Card
                url={`/textures/images.jpg`}
                position={[-60, 2, -10]}
                rotation={[0, 2, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />
            <Card
                url={`/textures/project3.jpg`}
                position={[-50, 2, 30]}
                rotation={[0, 3.14, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />

            <Card
                url={`/textures/project3.jpg`}
                position={[-50, 2, 30]}
                rotation={[0, 3.14, 0]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />

            <SolarSystem
                rotation={[0, Math.PI * 3 / 2, 0]}
                position={[-15, 2, 20]}
                scale={[6, 5, 2]}
                setClicked={setClicked}
                clicked={clicked}
                setObjPos={setObjPos}
                setAngle={setAngle}
            />
        </group>
    )
}

export default Scene;