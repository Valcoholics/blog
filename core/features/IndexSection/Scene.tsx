import { Box } from '@maximeheckel/design-system';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  varying vec2 vUv;

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    uv.x *= aspect;

    vec2 center = vec2(0.5 * aspect, 0.5);
    float dist = distance(uv, center);

    // Animate bass without audio
    float bass = 0.3 + 0.2 * sin(iTime * 1.5);

    float slowTime = iTime * 0.5;
    float centerPulse = 0.5 + 0.5 * sin(slowTime * 3.0);
    float bassPulse = bass * 0.4;
    centerPulse = mix(centerPulse, 1.0, bassPulse);

    float waveSpeed = 2.0;
    float waveCount = 5.0;
    float radialWave = sin(dist * waveCount - slowTime * waveSpeed);
    radialWave = 0.5 + 0.5 * radialWave;

    float baseSize = 0.25;
    float size = baseSize + centerPulse * 0.08;

    float waveIntensity = 0.03;
    float waveFrequency = 20.0;
    float angle = atan(uv.y - center.y, uv.x - center.x);

    float wave = waveIntensity * sin(angle * waveFrequency + slowTime * 4.0);

    float circle1 = 1.0 - smoothstep(size + wave - 0.04, size + wave + 0.04, dist);
    float circle2 = 1.0 - smoothstep((size + 0.05 + wave) - 0.06, (size + 0.05 + wave) + 0.06, dist);
    float circle3 = 1.0 - smoothstep((size + 0.1 + wave) - 0.08, (size + 0.1 + wave) + 0.08, dist);

    circle1 *= mix(1.0, radialWave, 0.3);
    circle2 *= mix(1.0, radialWave, 0.2);
    circle3 *= mix(1.0, radialWave, 0.1);

    circle1 *= (0.9 + bass * 0.2);

    vec3 debugCircle1 = vec3(circle1, 0.0, 0.0);

    vec3 combined = debugCircle1 * 0.7 +
                   vec3(circle2) * 0.5 +
                   vec3(circle3) * 0.3;

    vec3 baseColor = 0.5 + 0.5 * cos(slowTime * 0.5 + vec3(0, 2, 4) + bass * 0.5);
    baseColor = mix(baseColor, vec3(1.0), 0.7);

    vec3 color = baseColor * (0.9 + 0.1 * centerPulse + bass * 0.1);

    color *= combined * (1.5 + bass * 0.2);

    float radial = 1.0 - smoothstep(0.1, 0.8, dist);
    color *= (0.7 + 0.3 * radial);

    float centerGlow = 1.0 - smoothstep(0.0, 0.1 + bass * 0.05, dist);
    color += centerGlow * baseColor * (0.1 + bass * 0.1);

    vec3 blurred = color;
    float blurAmount = 0.004;
    int samples = 0;

    for (int i = -2; i <= 2; i++) {
      for (int j = -2; j <= 2; j++) {
        if (i != 0 || j != 0) {
          vec2 offset = vec2(float(i), float(j)) * blurAmount;
          vec2 sampleUV = uv + offset;

          if (sampleUV.x >= 0.0 && sampleUV.x <= aspect &&
              sampleUV.y >= 0.0 && sampleUV.y <= 1.0) {

            float sampleDist = distance(sampleUV, center);
            float sampleAngle = atan(sampleUV.y - center.y, sampleUV.x - center.x);
            float sampleWave = waveIntensity * sin(sampleAngle * waveFrequency + slowTime * 4.0);

            float sampleCircle1 = 1.0 - smoothstep(size + sampleWave - 0.04, size + sampleWave + 0.04, sampleDist);
            float sampleCircle2 = 1.0 - smoothstep((size + 0.05 + sampleWave) - 0.06, (size + 0.05 + sampleWave) + 0.06, sampleDist);
            float sampleCircle3 = 1.0 - smoothstep((size + 0.1 + sampleWave) - 0.08, (size + 0.1 + sampleWave) + 0.08, sampleDist);

            float sampleRadialWave = sin(sampleDist * waveCount - slowTime * waveSpeed);
            sampleRadialWave = 0.5 + 0.5 * sampleRadialWave;

            sampleCircle1 *= mix(1.0, sampleRadialWave, 0.3);
            sampleCircle2 *= mix(1.0, sampleRadialWave, 0.2);
            sampleCircle3 *= mix(1.0, sampleRadialWave, 0.1);

            sampleCircle1 *= (0.9 + bass * 0.2);

            vec3 sampleDebugCircle1 = vec3(sampleCircle1, 0.0, 0.5);

            vec3 sampleCombined = sampleDebugCircle1 * 0.7 +
                                 vec3(sampleCircle2) * 0.5 +
                                 vec3(sampleCircle3) * 0.3;

            vec3 sampleBaseColor = 0.5 + 0.5 * cos(slowTime * 0.5 + vec3(0, 2, 4) + bass * 0.5);
            sampleBaseColor = mix(sampleBaseColor, vec3(1.0), 0.7);
            vec3 sampleColor = sampleBaseColor * (0.9 + 0.1 * centerPulse + bass * 0.1);
            sampleColor *= sampleCombined * (1.5 + bass * 0.2);

            float sampleRadial = 1.0 - smoothstep(0.1, 0.8, sampleDist);
            sampleColor *= (0.7 + 0.3 * sampleRadial);

            float sampleCenterGlow = 1.0 - smoothstep(0.0, 0.1 + bass * 0.05, sampleDist);
            sampleColor += sampleCenterGlow * sampleBaseColor * (0.1 + bass * 0.1);

            blurred += sampleColor;
            samples++;
          }
        }
      }
    }

    blurred /= float(samples + 1);

    color = mix(color, blurred, 0.25);

    float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - vec2(0.5 * aspect, 0.5)));
    color *= vignette;

    color = pow(color, vec3(1.0/1.2));
    fragColor = vec4(color, 1.0);
  }

  void main() {
    mainImage(gl_FragColor, vUv * iResolution);
  }
`;

const StarVizShader = ({ shouldStop = false }: { shouldStop?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size]
  );

  useFrame((state) => {
    if (!shouldStop && meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.iTime.value = state.clock.elapsedTime;
        material.uniforms.iResolution.value.set(size.width, size.height);
        material.uniformsNeedUpdate = true;
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        needsUpdate={true}
      />
    </mesh>
  );
};

export const Scene = () => {
  const shouldReduceMotion = useReducedMotion();

  if (typeof window !== 'undefined' && window.Cypress) {
    return null;
  }

  return (
    <Box
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '120dvh',
        zIndex: 0,
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
      }}
    >
      <Canvas
        id="main-canvas"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
      >
        <color attach="background" args={['#000000']} />
        <StarVizShader shouldStop={!!shouldReduceMotion} />
      </Canvas>
    </Box>
  );
};
