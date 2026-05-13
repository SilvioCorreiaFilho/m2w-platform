/**
 * Extends React's JSX namespace with Three.js / R3F intrinsic elements.
 * Required because @react-three/fiber 8.x declares JSX.IntrinsicElements
 * in the global namespace, which conflicts with React 19's react-jsx transform.
 */
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
