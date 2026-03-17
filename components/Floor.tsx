import {Plane} from "@react-three/drei";
import type {PlaneProps} from "./Structure";

export default function Floor(props: PlaneProps){
    return (
        <Plane receiveShadow args={[props.width, props.height]}
               position={props.position}
               rotation={[-1.5,0,0]}>
                <meshStandardMaterial color="#ff0" roughness={0.4} metalness={0.15} />
        </Plane>
    )
}
