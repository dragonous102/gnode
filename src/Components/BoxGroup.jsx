import { useEffect, useState, useRef } from 'react'
import { Physics, usePlane, useBox } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { isPointVisible } from "../utils"

function Plane(props) {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
    return (
        <mesh receiveShadow ref={ref}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#f0f0f0" transparent={true} opacity={0} />
        </mesh>
    )
}

function Cube(props) {
    const [ref] = useBox(() => ({ mass: 1, ...props }))
    return (
        <mesh castShadow ref={ref}>
            <boxGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>
    )
}

export default function App({ position }) {
    const [ready, set] = useState(false)
    const ref = useRef()

    const [visible, setVisible] = useState(false);
    const { camera } = useThree();
    useEffect(() => {
        const timeout = setTimeout(() => set(true), 1000)
        return () => clearTimeout(timeout)
    }, [])
    useFrame(() => {
        const shouldBeVisible = isPointVisible(ref.current.position, camera.position);
        setVisible(shouldBeVisible);

    })
    return (
        <mesh ref={ref} position={position}>
            {
                visible && <Physics gravity={[0, -20, 0]}>
                    <Plane />
                    <Cube position={[0, 3, 0]} />
                    <Cube position={[0.45, 5, -0.25]} />
                    <Cube position={[-0.45, 7, 0.25]} />
                    {ready && <Cube position={[-0.45, 8, 0.25]} />}
                </Physics>
            }

        </mesh>
    )
}
