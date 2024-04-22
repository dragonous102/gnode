import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Physics, useSphere } from "@react-three/cannon"
import { easing } from 'maath'

import { isPointVisible, findClosestPoint, calculateFigureEightPoints } from "../utils";


function Road() {
    let radius = 50; // radius of each lobe of the eight
    let numPoints = 10000; // number of points to calculate

    let points = calculateFigureEightPoints(radius, 0, numPoints);
    let points1 = calculateFigureEightPoints(radius, 3, numPoints);
    let points2 = calculateFigureEightPoints(radius, -3, numPoints);
    let points3 = calculateFigureEightPoints(radius, 1.5, numPoints);
    let points4 = calculateFigureEightPoints(radius, -1.5, numPoints);

    points.push(points[0]);
    points1.push(points1[0]);
    points2.push(points2[0]);
    points3.push(points2[0]);
    points4.push(points2[0]);

    return (
        <>
            <Ecliptic points={points} />
            <Ecliptic points={points1} />
            <Ecliptic points={points2} />
            <Ecliptic points={points3} />
            <Ecliptic points={points4} />

            <Physics gravity={[0, 2, 0]} iterations={10}>
                <Pointer />
                <Clump />
            </Physics>

        </>
    );
}
const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(0.5, 36, 36)
const baubleMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0, envMapIntensity: 1 })

function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) {
    const texture = useTexture("/textures/sky.jpg")
    const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))
    const { camera } = useThree();


    useFrame((state, delta) => {
        const shouldBeVisible = isPointVisible(ref.current.position, camera.position);

        for (let i = 0; i < 30; i++) {
            // Get current whereabouts of the instanced sphere
            ref.current.getMatrixAt(i, mat)
            // This is enough to drive it towards the center-point.
            api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(), [0, 0, 0])
        }

        easing.damp3(ref.current.scale, shouldBeVisible ? 1 : 0, 0.25, delta)

    })
    return (
        <>
            <instancedMesh position={[3, 2, 3]} ref={ref} castShadow receiveShadow args={[sphereGeometry, baubleMaterial, 30]} material-map={texture}>
            </instancedMesh>
        </>

    )
}
function Pointer() {
    const viewport = useThree((state) => state.viewport)
    const [, api] = useSphere(() => ({ type: "Kinematic", args: [3], position: [0, 0, 0] }))
    return useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0))
}
function Ecliptic({ points }) {
    const fromColor = new THREE.Color(0x332222); // Black color

    const { camera } = useThree();
    const lineRef = useRef();
    const [visiblePoints, setVisiblePoints] = useState(points)

    // Memoize the computed visible segments to avoid recalculation on every render
    useFrame(() => {
        let visibleSegments = [];
        let closestPoint = findClosestPoint(points, camera.position);
        let count = -10;
        while (count < 1500) {
            let index = count + closestPoint;
            if (index > points.length - 1) {
                index = index - points.length
            }
            const element = points[index];
            // console.log(element);
            visibleSegments.push(element)

            count++
        }
        // setVisiblePoints(visibleSegments)
    })

    return (
        <Line
            ref={lineRef}

            lineWidth={0.02}
            worldUnits
            dashed
            dashScale={4}
            gapSize={4}
            points={visiblePoints?.length > 0 ? visiblePoints : points}
            color={fromColor}
        />
    );
}

export default Road;