import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import DistanceFunction from './distanceFunction';
import SmoothstepFunction from './smoothstepFunction';
import ConcentricCircles from './concentricCircles';
import Atan2Transformation from './atan2Transformation';
import AudioReactive from './audioReactive';
import NeighborhoodSampling from './neighborhoodSampling';
import FullVisualization from './fullVisualization';

const CSSCode = `
html {
    background: #000;
}

body {
  height: 100%;
  margin: 0;
  background: #000;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const StarVizSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: DistanceFunction,
    scene2: SmoothstepFunction,
    scene3: ConcentricCircles,
    scene4: Atan2Transformation,
    scene5: AudioReactive,
    scene6: NeighborhoodSampling,
    scene7: FullVisualization,
  };

  return (
    <Box css={{ width: '100%' }} ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.70.4',
            '@react-three/fiber': '8.11.2',
            three: '0.149.0',
            uuid: '^9.0.0',
          }}
          files={{
            // @ts-ignore
            ...SCENES[scene],
            '/scene.css': {
              code: CSSCode,
              hidden: true,
            },
            '/sandbox.config.json': {
              code: `{ "infiniteLoopProtection" :  false }`,
              hidden: true,
            },
          }}
        />
      ) : (
        <Box
          css={{
            height: '520px',
            '@media(max-width: 750px)': {
              height: '1060px',
            },
          }}
        />
      )}
    </Box>
  );
};

export default StarVizSandpack;
