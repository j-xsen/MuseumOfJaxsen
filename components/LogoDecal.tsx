import { useKTX2 } from "@react-three/drei";

export default function LogoDecal() {
  const texture = useKTX2("/textures/logo.ktx2");

  return (
    <mesh position={[0, 4, 0.01]}>
      <planeGeometry args={[1.8, 1.8 * (218 / 512)]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
