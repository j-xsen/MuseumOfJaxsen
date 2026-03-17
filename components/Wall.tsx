import {Plane} from "@react-three/drei";
import type {PlaneProps} from "./Structure";

export default function Wall(props: PlaneProps){
    return (
        <Plane receiveShadow args={[props.width, props.height]}
        position={props.position}>
            <meshStandardMaterial color="#f0f" roughness={0.88} metalness={0.02} />
        </Plane>
    )
}