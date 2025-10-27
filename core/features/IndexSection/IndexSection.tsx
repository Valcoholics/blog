import { Box, Flex, Grid, Text } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
});

const IndexSection = () => {
  return (
    <>
      <Scene />
      <Grid.Item
        col={2}
        justifySelf="center"
        css={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          minHeight: 'clamp(400px, 90dvh, 900px)',
        }}
      >
        <Box
          id="index"
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            pointerEvents: 'auto',
            zIndex: 1,
            height: 170,
            width: 380,
            paddingTop: 24,
            maskImage: 'radial-gradient(ellipse, black 50%, transparent 72%)',
          }}
        >
          <Text
            as="h1"
            css={{
              letterSpacing: '-1.5px',
              lineHeight: 1.2,
              maxWidth: 400,
              textWrap: 'balance',
              textAlign: 'center',
            }}
            family="serif"
            size="8"
            variant="primary"
            weight="3"
          >
            Exploring{' '}
            <Text
              as="span"
              css={{
                letterSpacing: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit',
                fontStyle: 'italic',
              }}
              variant="primary"
            >
              sonic identity
            </Text>{' '}
            through creative code.
          </Text>
        </Box>
      </Grid.Item>
      <Grid.Item col={2} justifySelf="center">
        <Flex css={{ maxWidth: 450, padding: '0 16px' }}>
          <Text
            as="p"
            css={{
              textAlign: 'center',
              textWrap: 'balance',
              letterSpacing: '-1.0px',
            }}
            variant="secondary"
            size="4"
            weight="3"
          >
            Hi I&apos;m Valerie Andy, and this is my blog. Home to my audio
            visualizer series exploring sonic identity through creative code,
            released every Wednesday.
            <br />
            <br />
            As a computational designer, I dive deep into the intersection of
            sound, code, and visual expression, creating interactive experiences
            that bring audio to life. Each piece aims to make complex topics
            accessible through interactive demonstrations and detailed
            walkthroughs.
          </Text>
        </Flex>
      </Grid.Item>
    </>
  );
};

export { IndexSection };
