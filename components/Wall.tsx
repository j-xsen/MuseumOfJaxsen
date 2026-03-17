import { useMemo } from "react";
import { Plane, useKTX2 } from "@react-three/drei";
import { RepeatWrapping } from "three";
import type { PlaneProps } from "./Structure";

export default function Wall(props: PlaneProps) {
  const texture = useKTX2("/textures/wall.ktx2", "/basis/");

  useMemo(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(props.width / 3, props.height / 3);
    texture.needsUpdate = true;
  }, [texture, props.width, props.height]);

  return (
    <Plane receiveShadow args={[props.width, props.height]} position={props.position}>
      <meshStandardMaterial map={texture} roughness={0.88} metalness={0.02} />
    </Plane>
  );
}
