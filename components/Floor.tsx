import { useMemo } from "react";
import { Plane, useKTX2 } from "@react-three/drei";
import { RepeatWrapping } from "three";
import type { PlaneProps } from "./Structure";

export default function Floor(props: PlaneProps) {
  const texture = useKTX2("/textures/floor.ktx2");

  useMemo(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(props.width / 2, props.height / 2);
    texture.needsUpdate = true;
  }, [texture, props.width, props.height]);

  return (
    <Plane receiveShadow args={[props.width, props.height]}
           position={props.position}
           rotation={[-1.5, 0, 0]}>
      <meshStandardMaterial map={texture} roughness={0.4} metalness={0.15} />
    </Plane>
  );
}
