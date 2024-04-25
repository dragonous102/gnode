import React, { useRef, useState } from 'react'
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from 'maath'
import { isPointVisible } from "../utils"
import { Physics, usePlane, useBox, useCylinder } from '@react-three/cannon'

function Plane(props) {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
    return (
        <mesh receiveShadow ref={ref}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#000" transparent={true} opacity={0} />
        </mesh>
    )
}

function Cube(props) {
    const [ref, api] = useCylinder(() => ({ mass: 1, ...props }))
    const [isClicked, setIsClicked] = useState(false);
    const onClick = () => {
        setIsClicked(!isClicked);
    };

    useFrame((state, delta) => {
        let currentScaleY = ref.current.scale.y;
        let targetScaleY = isClicked ? 0.3 : props.scale[1]; // Assuming props.scale is an array like [1, 1, 1]
        let nextScaleY = currentScaleY + (targetScaleY - currentScaleY) * delta * 8; // Change 4 to adjust the speed
        ref.current.scale.set(props.scale[0], nextScaleY, props.scale[2]);
        if (ref.current.scale.y < 0.5) {
            setIsClicked(!isClicked)
            currentScaleY = ref.current.scale.y;
            targetScaleY = props.scale[1]; // Assuming props.scale is an array like [1, 1, 1]
            nextScaleY = currentScaleY + (targetScaleY - currentScaleY) * delta * 8; // Change 4 to adjust the speed
            ref.current.scale.set(props.scale[0], nextScaleY, props.scale[2]);

        }
    })
    return (
        <mesh ref={ref} scale={props.scale} onClick={onClick} // Attach onClick event here
        >
            <cylinderGeometry attach="geometry" args={[1, 1, 1]} />
            <meshPhongMaterial attach="material" color="#adff71" flatShading={true} />
        </mesh>
    )
}

export default function App({ position }) {
    const ref = useRef()
    const { camera } = useThree();
    const [visible, setVisible] = useState(false);
    useFrame((state, delta) => {
        const shouldBeVisible = isPointVisible(ref.current.position, camera.position);
        setVisible(shouldBeVisible);

        // easing.damp3(ref.current.scale, (visible ? 8 : 0), 0.25, delta)
    })
    return (
        <mesh ref={ref} position={position}>
            {visible && <Physics gravity={[0, -20, 0]}>
                <Plane />
                <directionalLight position={[-1, -1, -1]} color="#ffd738" />
                <ambientLight color="#444444" />
                <Cube position={[8, 5, -4]} scale={[0.3, Math.random() * 2 + 1, 0.3]} ></Cube>
                <Cube position={[10, 6, -6]} scale={[0.3, Math.random() * 2 + 1, 0.3]}></Cube>
                <Cube position={[12, 8, -8]} scale={[0.3, Math.random() * 2 + 1, 0.3]}></Cube>
                <Cube position={[8, 10, -10]} scale={[0.3, Math.random() * 2 + 1, 0.3]}></Cube>
                <Cube position={[10, 12, -12]} scale={[0.3, Math.random() * 2 + 1, 0.3]}></Cube>
                <Cube position={[13, 13, -12]} scale={[0.3, Math.random() * 2 + 1, 0.3]}></Cube>
            </Physics>}
        </mesh>
    )
}

