import {
  Box,
  Flex,
  Grid,
  H2,
  Text,
  Card,
  Button,
  Anchor,
} from '@maximeheckel/design-system';
import React from 'react';

import { BottomBlurGradientMask } from '@core/components/BottomBlurGradientMask';
import { Dock } from '@core/components/Dock';
import { Main } from '@core/components/Main';
import Seo from '@core/components/Seo';
import Footer from '@core/components/Footer';
import { ScrambledText } from '@core/components/ScrambledText';

const Header = () => {
  return (
    <Box
      as="header"
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        marginTop: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <Grid templateColumns="auto 1fr auto" gapY={2}>
        <Grid.Item col={2} justifySelf="center">
          <Dock />
        </Grid.Item>
      </Grid>
    </Box>
  );
};

const OfferingsPage = () => {
  const [consultingExpanded, setConsultingExpanded] = React.useState(false);
  const [sonicExpanded, setSonicExpanded] = React.useState(false);
  const [tier1Expanded, setTier1Expanded] = React.useState(false);
  const [tier2Expanded, setTier2Expanded] = React.useState(false);
  const [technicalExpanded, setTechnicalExpanded] = React.useState(false);
  const [bookingExpanded, setBookingExpanded] = React.useState(false);

  return (
    <Main>
      <Seo title="Design Services - Offerings" />
      <Header />
      <Grid
        as="article"
        css={{
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--background)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
        }}
        gapX={4}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        <Grid.Item
          col={2}
          justifySelf="center"
          css={{
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            gap: 'var(--space-3)',
            width: '100%',
            position: 'relative',

            '@sm': {
              minHeight: 'clamp(300px, 55dvh, 400px)',
            },
          }}
        >
          <Text
            as="h1"
            css={{
              fontWeight: 400,
              letterSpacing: '-1.0px',
              lineHeight: 1.2,
              textWrap: 'balance',
              textAlign: 'left',
            }}
            family="serif"
            size="8"
            weight="3"
            variant="primary"
          >
            Design Services
          </Text>
          <ScrambledText
            css={{
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease-in-out',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-1px',
              textTransform: 'uppercase',
            }}
            delay={0.5}
            speed={0.8}
            size="1"
            variant="tertiary"
            windowSize={3}
          >
            Creative solutions for your design needs
          </ScrambledText>
        </Grid.Item>
        <Grid.Item col={2}>
          <Flex
            alignItems="start"
            direction="column"
            css={{
              padding: 'var(--space-6) 0px',
              color: 'var(--text-secondary)',
            }}
            gap="10"
          >

          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
          >
            <Grid gapY={6} css={{ width: '100%' }}>
              <Card variant="primary">
                <Card.Header>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    css={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
                    onClick={() => setConsultingExpanded(!consultingExpanded)}
                  >
                    <Text as="span">Creative Consulting (1-on-1)</Text>
                    <Text as="span" variant="tertiary" css={{ fontSize: '24px' }}>
                      {consultingExpanded ? '−' : '+'}
                    </Text>
                  </Flex>
                </Card.Header>
                {consultingExpanded && (
                  <Card.Body>
                    <Grid gapY={3}>
                      <Text as="p" variant="secondary">
                        Problem solving and scoping sessions with mind maps, mood boards, and recordings.
                      </Text>
                      <Box>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • 1 hour consultation
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Session recording
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Figjam / Moodboard
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Intake form included
                        </Text>
                      </Box>
                      <Text as="p" weight="4" variant="primary" css={{ fontSize: '18px' }}>
                        $180/hour
                      </Text>
                    </Grid>
                  </Card.Body>
                )}
              </Card>

              <Card variant="primary">
                <Card.Header>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    css={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
                    onClick={() => setSonicExpanded(!sonicExpanded)}
                  >
                    <Text as="span">Sonic Branding & Event Visuals</Text>
                    <Text as="span" variant="tertiary" css={{ fontSize: '24px' }}>
                      {sonicExpanded ? '−' : '+'}
                    </Text>
                  </Flex>
                </Card.Header>
                {sonicExpanded && (
                  <Card.Body>
                    <Grid gapY={4}>
                      <Box>
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                          css={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => setTier1Expanded(!tier1Expanded)}
                        >
                          <Text as="p" weight="4" variant="primary">
                            Tier 1: Pre-Rendered Animated Video Content
                          </Text>
                          <Text as="span" variant="tertiary">
                            {tier1Expanded ? '−' : '+'}
                          </Text>
                        </Flex>
                        {tier1Expanded && (
                          <Grid gapY={2} css={{ marginTop: 'var(--space-2)' }}>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Creative consultation & moodboard (2-3 visual direction concepts, one round of revisions)
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Custom designed visuals based on your creative direction
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Standard animation (non-audio reactive) delivered as MP4 files via shared Google Drive
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Ready for playback on TV/projector via any media player
                            </Text>
                          </Grid>
                        )}
                      </Box>

                      <Box>
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                          css={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => setTier2Expanded(!tier2Expanded)}
                        >
                          <Text as="p" weight="4" variant="primary">
                            Tier 2: Audio-Reactive Content
                          </Text>
                          <Text as="span" variant="tertiary">
                            {tier2Expanded ? '−' : '+'}
                          </Text>
                        </Flex>
                        {tier2Expanded && (
                          <Grid gapY={2} css={{ marginTop: 'var(--space-2)' }}>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Everything in Tier 1, PLUS
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Visuals with real-time audio reactivity (responds to music frequencies and BPM)
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Delivered as source project files (Resolume/TouchDesigner/code) via shared Google Drive
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • You can modify, reuse, and repurpose for future events
                            </Text>
                            <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                              • Full ownership and unlimited usage rights
                            </Text>
                          </Grid>
                        )}
                      </Box>

                      <Box>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Web Asset Creation - Custom quote
                        </Text>
                      </Box>
                    </Grid>
                  </Card.Body>
                )}
              </Card>

              <Card variant="primary">
                <Card.Header>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    css={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
                    onClick={() => setTechnicalExpanded(!technicalExpanded)}
                  >
                    <Text as="span">Technical Production for Immersive Events</Text>
                    <Text as="span" variant="tertiary" css={{ fontSize: '24px' }}>
                      {technicalExpanded ? '−' : '+'}
                    </Text>
                  </Flex>
                </Card.Header>
                {technicalExpanded && (
                  <Card.Body>
                    <Grid gapY={3}>
                      <Text as="p" variant="secondary">
                        Custom solutions for immersive experiences and interactive installations.
                      </Text>
                      <Box>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • AV Art installations
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Information dashboards for trade shows
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Web design + data visualization experiences
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Interactive microsites (unconventional info displays)
                        </Text>
                      </Box>
                      <Text as="p" weight="4" variant="primary">
                        Custom Quote
                      </Text>
                    </Grid>
                  </Card.Body>
                )}
              </Card>

              <Card variant="primary">
                <Card.Header>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    css={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
                    onClick={() => setBookingExpanded(!bookingExpanded)}
                  >
                    <Text as="span">Book to Perform or Speak</Text>
                    <Text as="span" variant="tertiary" css={{ fontSize: '24px' }}>
                      {bookingExpanded ? '−' : '+'}
                    </Text>
                  </Flex>
                </Card.Header>
                {bookingExpanded && (
                  <Card.Body>
                    <Grid gapY={3}>
                      <Text as="p" variant="secondary">
                        Available for live performances, workshops, and technical support.
                      </Text>
                      <Box>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • On-site VJ performances
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Workshop hosting
                        </Text>
                        <Text as="p" variant="secondary" css={{ fontSize: '14px' }}>
                          • Technical setup & troubleshooting
                        </Text>
                      </Box>
                      <Text as="p" weight="4" variant="primary">
                        Custom Quote
                      </Text>
                    </Grid>
                  </Card.Body>
                )}
              </Card>
            </Grid>
          </Flex>

          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
          >
            <H2>FAQ</H2>
            <Card variant="secondary">
              <Card.Body>
                <Box>
                  <Text as="p" weight="4" variant="primary">
                    Are you open to freelance projects?
                  </Text>
                  <Text as="p" variant="secondary">
                    Yep, I am open for projects.
                  </Text>
                </Box>
              </Card.Body>
            </Card>
          </Flex>

          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
          >
            <H2>Get in Touch</H2>
            <Card variant="tertiary">
              <Card.Body>
                <Flex direction="column" gap="4">
                  <Text as="p" variant="secondary">
                    Interested in working together? I&apos;d love to hear about your
                    project and explore how we can collaborate.
                  </Text>
                  <Flex direction="column" gap="2">
                    <Text as="p" variant="secondary">
                      Email:{' '}
                      <Anchor href="mailto:contact@data-v.site" discreet={false}>
                        contact@data-v.site
                      </Anchor>
                    </Text>
                  </Flex>
                  <Flex gap="3">
                    <Anchor
                      href="https://www.instagram.com/data____v/"
                      external
                      discreet={false}
                    >
                      <Button variant="primary">Instagram</Button>
                    </Anchor>
                    <Anchor
                      href="https://github.com/Valcoholics"
                      external
                      discreet={false}
                    >
                      <Button variant="secondary">GitHub</Button>
                    </Anchor>
                  </Flex>
                </Flex>
              </Card.Body>
            </Card>
          </Flex>
          </Flex>
        </Grid.Item>
      </Grid>
      <BottomBlurGradientMask />
      <Footer />
    </Main>
  );
};

export default OfferingsPage;
