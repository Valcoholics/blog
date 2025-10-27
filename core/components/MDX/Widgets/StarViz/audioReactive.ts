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

  // Simulate bass reactivity
  float bass = 0.3 + 0.2 * sin(uTime * 1.5);
  bass = clamp(bass, 0.0, 0.7);

  float slowTime = uTime * 0.5;

  // Center pulse with bass influence
  float centerPulse = 0.5 + 0.5 * sin(slowTime * 3.0);
  float bassPulse = bass * 0.4;
  centerPulse = mix(centerPulse, 1.0, bassPulse);

  // Radial breathing wave
  float waveSpeed = 2.0;
  float waveCount = 5.0;
  float radialWave = sin(dist * waveCount - slowTime * waveSpeed);
  radialWave = 0.5 + 0.5 * radialWave;

  float baseSize = 0.25;
  float size = baseSize + centerPulse * 0.08;

  // Angular wave for star shape
  float angle = atan(uv.y - center.y, uv.x - center.x);
  float waveIntensity = 0.03;
  float waveFrequency = 20.0;
  float wave = waveIntensity * sin(angle * waveFrequency + slowTime * 4.0);

  // Create three concentric circles with wave
  float circle1 = 1.0 - smoothstep(size + wave - 0.04, size + wave + 0.04, dist);
  float circle2 = 1.0 - smoothstep((size + 0.05 + wave) - 0.06, (size + 0.05 + wave) + 0.06, dist);
  float circle3 = 1.0 - smoothstep((size + 0.1 + wave) - 0.08, (size + 0.1 + wave) + 0.08, dist);

  // Apply radial wave
  circle1 *= mix(1.0, radialWave, 0.3);
  circle2 *= mix(1.0, radialWave, 0.2);
  circle3 *= mix(1.0, radialWave, 0.1);

  // Apply bass reactivity
  circle1 *= (0.9 + bass * 0.2);

  // Combine circles
  vec3 combined = vec3(circle1) * 0.7 +
                  vec3(circle2) * 0.5 +
                  vec3(circle3) * 0.3;

  // Color with bass influence
  vec3 baseColor = 0.5 + 0.5 * cos(slowTime * 0.5 + vec3(0, 2, 4) + bass * 0.5);
  baseColor = mix(baseColor, vec3(1.0), 0.7);

  vec3 color = baseColor * (0.9 + 0.1 * centerPulse + bass * 0.1);
  color *= combined * (1.5 + bass * 0.2);

  // Radial falloff
  float radial = 1.0 - smoothstep(0.1, 0.8, dist);
  color *= (0.7 + 0.3 * radial);

  // Center glow
  float centerGlow = 1.0 - smoothstep(0.0, 0.1 + bass * 0.05, dist);
  color += centerGlow * baseColor * (0.1 + bass * 0.1);

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

const AudioReactive = {
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

export default AudioReactive;
