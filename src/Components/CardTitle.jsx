import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useScroll } from "@react-three/drei";
import { easing } from 'maath'
import { isPointVisible } from '../utils'

const CardTitle = ({ position, rotation, title }) => {
    const ref = useRef()
    const { camera } = useThree();
    const scrollData = useScroll();

    useFrame((state, delta) => {

        const shouldBeVisible = isPointVisible(ref.current.position, camera.position);
        easing.damp3(ref.current.scale, shouldBeVisible ? 1 : 0, 0.25, delta)
    })

    return (
        <mesh ref={ref} position={position} rotation={rotation}>
            <Html transform portal={{ current: scrollData.fixed }} >
                <div className="content" >
                    {title}
                </div>
            </Html>
        </mesh>
    )

}
export default CardTitle;