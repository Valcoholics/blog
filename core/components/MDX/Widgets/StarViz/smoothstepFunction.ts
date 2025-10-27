const VertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const FragmentShader = `uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  vec2 center = vec2(0.5 * aspect, 0.5);
  float dist = distance(uv, center);

  // Create a circle using smoothstep
  // The two values control the edge softness
  float size = 0.25;
  float circle = 1.0 - smoothstep(size - 0.04, size + 0.04, dist);

  // Animate the size to show the effect
  float animatedSize = 0.25 + 0.05 * sin(uTime * 2.0);
  float animatedCircle = 1.0 - smoothstep(animatedSize - 0.04, animatedSize + 0.04, dist);

  vec3 color = vec3(animatedCircle);

  gl_FragColor = vec4(color, 1.0);
}
`;

const AppCode = `import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const DPR = 1;

const StarViz = () => {
  const mesh = useRef();
  const { viewport } = useThree();

  const uniforms = {
    uTime: new THREE.Uniform(0.0),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
  };

  useFrame((state) => {
    const { clock } = state;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR
    );
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        key={uuidv4()}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} dpr={DPR}>
      <Suspense fallback={null}>
        <StarViz />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
`;

const SmoothstepFunction = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
};

export default SmoothstepFunction;
