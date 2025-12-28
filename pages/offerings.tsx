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
import Footer from '@core/components/Footer';
import { Main } from '@core/components/Main';
import { ScrambledText } from '@core/components/ScrambledText';
import Seo from '@core/components/Seo';

// ============================================
// REUSABLE ACCORDION COMPONENT
// ============================================
interface AccordionCardProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: 'primary' | 'secondary' | 'featured';
}

const AccordionCard: React.FC<AccordionCardProps> = ({
  title,
  badge,
  children,
  defaultExpanded = false,
  variant = 'primary',
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const cardStyles = {
    featured: {
      background:
        'linear-gradient(135deg, var(--emphasis) 0%, var(--background) 100%)',
      border: '1px solid var(--accent)',
    },
    primary: {},
    secondary: {},
  };

  return (
    <Card
      variant={variant === 'featured' ? 'primary' : variant}
      css={{
        ...cardStyles[variant],
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Card.Header>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          css={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
          onClick={() => setExpanded(!expanded)}
          role="button"
          aria-expanded={expanded}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(!expanded);
            }
          }}
        >
          <Flex alignItems="center" gap="3">
            <Text as="span" weight={variant === 'featured' ? '4' : '3'}>
              {title}
            </Text>
            {badge && (
              <Text
                as="span"
                css={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--accent)',
                  color: 'var(--background)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {badge}
              </Text>
            )}
          </Flex>
          <Text
            as="span"
            variant="tertiary"
            css={{
              fontSize: '24px',
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            +
          </Text>
        </Flex>
      </Card.Header>
      <Box
        css={{
          maxHeight: expanded ? '1000px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        {expanded && <Card.Body>{children}</Card.Body>}
      </Box>
    </Card>
  );
};

// ============================================
// SERVICE LIST ITEM COMPONENT
// ============================================
interface ServiceItemProps {
  children: React.ReactNode;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ children }) => (
  <Flex as="li" alignItems="baseline" gap="2">
    <Box
      css={{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'var(--accent)',
        flexShrink: 0,
        marginTop: '8px',
      }}
    />
    <Text as="span" variant="secondary" css={{ fontSize: '14px' }}>
      {children}
    </Text>
  </Flex>
);

// ============================================
// HEADER COMPONENT
// ============================================
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

// ============================================
// PRICING QUICK VIEW COMPONENT
// ============================================
const PricingQuickView = () => (
  <Flex
    gap="4"
    css={{
      flexWrap: 'wrap',
      padding: 'var(--space-4)',
      background: 'var(--emphasis)',
      borderRadius: '8px',
      border: '1px solid var(--border-primary)',
      alignSelf: 'stretch',
      width: '100%',
      '@sm': {
        padding: 'var(--space-3)',
        gap: 'var(--space-3)',
      },
    }}
  >
    <Flex direction="column" gap="1" css={{ flex: '1 1 120px' }}>
      <Text
        variant="tertiary"
        css={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Consulting
      </Text>
      <Text weight="4" variant="primary" css={{ fontSize: '20px' }}>
        $180
        <Text as="span" variant="tertiary" css={{ fontSize: '14px' }}>
          /hr
        </Text>
      </Text>
    </Flex>
    <Flex direction="column" gap="1" css={{ flex: '1 1 120px' }}>
      <Text
        variant="tertiary"
        css={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Sonic Branding
      </Text>
      <Text weight="4" variant="primary" css={{ fontSize: '20px' }}>
        From $800
      </Text>
    </Flex>
    <Flex direction="column" gap="1" css={{ flex: '1 1 120px' }}>
      <Text
        variant="tertiary"
        css={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Technical Production
      </Text>
      <Text weight="4" variant="primary" css={{ fontSize: '20px' }}>
        Request Quote
      </Text>
    </Flex>
  </Flex>
);

// ============================================
// PROCESS SECTION COMPONENT
// ============================================
const ProcessSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Discovery',
      description:
        'We start with an intake form and consultation to understand your vision, audience, and goals.',
    },
    {
      number: '02',
      title: 'Concept',
      description:
        'I create moodboards and 2-3 visual direction concepts for your review and feedback.',
    },
    {
      number: '03',
      title: 'Create',
      description:
        'Once aligned, I build your custom visuals with one round of revisions included.',
    },
  ];

  return (
    <Flex
      direction="column"
      gap="5"
      as="section"
      css={{ alignSelf: 'stretch' }}
    >
      <H2>How I Work</H2>
      <Grid
        css={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-4)',
          '@sm': {
            gridTemplateColumns: '1fr',
            gap: 'var(--space-3)',
          },
        }}
      >
        {steps.map((step) => (
          <Flex key={step.number} direction="column" gap="2">
            <Text
              css={{
                fontFamily: 'var(--font-mono)',
                fontSize: '32px',
                color: 'var(--accent)',
                opacity: 0.6,
              }}
            >
              {step.number}
            </Text>
            <Text weight="4" variant="primary">
              {step.title}
            </Text>
            <Text variant="secondary" css={{ fontSize: '14px' }}>
              {step.description}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Flex>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
const OfferingsPage = () => {
  const [tier1Expanded, setTier1Expanded] = React.useState(false);
  const [tier2Expanded, setTier2Expanded] = React.useState(false);

  return (
    <Main>
      <Seo title="Design Services" />
      <Header />
      <Grid
        as="article"
        css={{
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--background)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
          '@sm': {
            gridTemplateColumns: '1fr',
            padding: '0 var(--space-4)',
          },
        }}
        gapX={4}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        {/* HERO SECTION */}
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
              minHeight: 'clamp(280px, 40dvh, 360px)',
              gridColumn: '1',
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
              '@sm': {
                fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
              },
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
              '@sm': {
                whiteSpace: 'normal',
                fontSize: '11px',
              },
            }}
            delay={0.5}
            speed={0.8}
            size="1"
            variant="tertiary"
            windowSize={3}
          >
            Audio-reactive visuals • Sonic branding • Creative tech
          </ScrambledText>

          {/* INTRO PARAGRAPH - New addition */}
          <Text
            as="p"
            variant="secondary"
            css={{
              marginTop: 'var(--space-4)',
              lineHeight: 1.6,
            }}
          >
            I create custom visual identities and immersive experiences for DJs,
            event producers, and brands who want visuals that move with the
            music.
          </Text>
        </Grid.Item>

        {/* MAIN CONTENT */}
        <Grid.Item
          col={2}
          css={{
            '@sm': {
              gridColumn: '1',
            },
          }}
        >
          <Flex
            alignItems="start"
            direction="column"
            css={{
              padding: 'var(--space-6) 0px',
              color: 'var(--text-secondary)',
              gap: 'var(--space-10)',
              '@sm': {
                padding: 'var(--space-4) 0px',
                gap: 'var(--space-6)',
              },
            }}
          >
            {/* PRICING QUICK VIEW */}
            <PricingQuickView />

            {/* SERVICES SECTION */}
            <Flex
              alignItems="start"
              as="section"
              css={{ alignSelf: 'stretch' }}
              direction="column"
              gap="5"
            >
              <H2>Services</H2>
              <Grid gapY={4} css={{ width: '100%' }}>
                {/* SONIC BRANDING - Featured as primary offering */}

                {/* CREATIVE CONSULTING */}
                <AccordionCard
                  title="Creative Consulting (1-on-1)"
                  badge="Popular"
                  variant="featured"
                  defaultExpanded={true}
                >
                  <Grid gapY={3}>
                    <Text as="p" variant="secondary">
                      A focused 90-minute working session designed to help you
                      clarify ideas, solve creative roadblocks, and shape your
                      next project with intention.
                    </Text>
                    <Text as="p" variant="secondary" weight="4">
                      Includes:
                    </Text>
                    <Box as="ul" css={{ listStyle: 'none', padding: 0 }}>
                      <Grid gapY={2}>
                        <ServiceItem>
                          Collaborative mind map & FigJam board
                        </ServiceItem>
                        <ServiceItem>
                          Session recording for future reference
                        </ServiceItem>
                      </Grid>
                    </Box>
                    <Button
                      as="a"
                      href="https://calendly.com/data-v/creative-consultation"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      Schedule Consultation
                    </Button>
                  </Grid>
                </AccordionCard>

                <AccordionCard title="Sonic Branding & Event Visuals">
                  <Grid gapY={4}>
                    <Text as="p" variant="secondary">
                      Visual systems designed to give your event or brand a
                      distinct sonic and visual identity.
                    </Text>

                    <Box>
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        css={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => setTier1Expanded(!tier1Expanded)}
                      >
                        <Text as="p" weight="4" variant="primary">
                          Tier 1 – Visual Direction
                        </Text>
                        <Text as="span" variant="tertiary">
                          {tier1Expanded ? '−' : '+'}
                        </Text>
                      </Flex>
                      {tier1Expanded && (
                        <Box
                          as="ul"
                          css={{
                            listStyle: 'none',
                            padding: 0,
                            marginTop: 'var(--space-2)',
                          }}
                        >
                          <Grid gapY={2}>
                            <ServiceItem>
                              Creative consultation & moodboard
                            </ServiceItem>
                            <ServiceItem>
                              2–3 visual direction concepts
                            </ServiceItem>
                            <ServiceItem>One revision round</ServiceItem>
                            <ServiceItem>
                              Delivered as MP4 files for easy playback on
                              screens or projectors
                            </ServiceItem>
                          </Grid>
                        </Box>
                      )}
                    </Box>

                    <Box
                      css={{
                        height: '1px',
                        background: 'var(--border-primary)',
                        opacity: 0.5,
                      }}
                    />

                    <Box>
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        css={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => setTier2Expanded(!tier2Expanded)}
                      >
                        <Text as="p" weight="4" variant="primary">
                          Tier 2 – Reactive Visual Systems
                        </Text>
                        <Text as="span" variant="tertiary">
                          {tier2Expanded ? '−' : '+'}
                        </Text>
                      </Flex>
                      {tier2Expanded && (
                        <Box
                          as="ul"
                          css={{
                            listStyle: 'none',
                            padding: 0,
                            marginTop: 'var(--space-2)',
                          }}
                        >
                          <Grid gapY={2}>
                            <ServiceItem>
                              Includes everything in Tier 1, plus:
                            </ServiceItem>
                            <ServiceItem>
                              Real-time audio-reactive visuals
                            </ServiceItem>
                            <ServiceItem>
                              Delivered as editable source files (Resolume /
                              TouchDesigner / code)
                            </ServiceItem>
                            <ServiceItem>
                              Full ownership and unlimited reuse across events
                            </ServiceItem>
                          </Grid>
                        </Box>
                      )}
                    </Box>

                    <Box
                      css={{
                        height: '1px',
                        background: 'var(--border-primary)',
                        opacity: 0.5,
                      }}
                    />

                    <Text as="p" variant="tertiary" css={{ fontSize: '14px' }}>
                      Web visualizer component available as additional delivery
                      option
                    </Text>

                    <Flex gap="3" css={{ marginTop: 'var(--space-2)' }}>
                      <Button
                        as="a"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                      >
                        Send Inquiry
                      </Button>
                      <Button
                        as="a"
                        href="https://www.behance.net/data-v"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                      >
                        View Portfolio
                      </Button>
                    </Flex>
                  </Grid>
                </AccordionCard>

                {/* TECHNICAL PRODUCTION */}
                <AccordionCard title="Technical Production for Immersive Events">
                  <Grid gapY={3}>
                    <Text as="p" variant="secondary">
                      I collaborate with artists, institutions, and experimental
                      teams developing immersive work that sits at the
                      intersection of art, code, and spatial storytelling.
                    </Text>
                    <Text as="p" variant="secondary" weight="4">
                      I&apos;m especially interested in projects involving:
                    </Text>
                    <Box as="ul" css={{ listStyle: 'none', padding: 0 }}>
                      <Grid gapY={2}>
                        <ServiceItem>
                          AV Art installations and real-time visual systems
                        </ServiceItem>
                        <ServiceItem>
                          Interactive dashboards for exhibitions and live
                          environments
                        </ServiceItem>
                        <ServiceItem>
                          Experimental microsites and data-driven interfaces
                        </ServiceItem>
                      </Grid>
                    </Box>
                    <Text as="p" weight="4" variant="primary">
                      Custom Quote
                    </Text>
                  </Grid>
                </AccordionCard>

                {/* BOOKING */}
                <AccordionCard title="Book to Perform or Speak">
                  <Grid gapY={3}>
                    <Text as="p" variant="secondary">
                      Available for live performances, workshops, and technical
                      support.
                    </Text>
                    <Box as="ul" css={{ listStyle: 'none', padding: 0 }}>
                      <Grid gapY={2}>
                        <ServiceItem>On-site VJ performances</ServiceItem>
                        <ServiceItem>
                          Workshop hosting (creative coding, live visuals)
                        </ServiceItem>
                        <ServiceItem>
                          Technical setup & troubleshooting
                        </ServiceItem>
                      </Grid>
                    </Box>
                    <Text as="p" weight="4" variant="primary">
                      Custom Quote
                    </Text>
                  </Grid>
                </AccordionCard>
              </Grid>
            </Flex>

            {/* PROCESS SECTION - New */}
            <ProcessSection />

            {/* FAQ SECTION - Expanded */}
            <Flex
              alignItems="start"
              as="section"
              css={{ alignSelf: 'stretch' }}
              direction="column"
              gap="5"
            >
              <H2>FAQ</H2>
              <Grid gapY={3} css={{ width: '100%' }}>
                <AccordionCard
                  title="Are you open to freelance projects?"
                  variant="secondary"
                >
                  <Text as="p" variant="secondary">
                    Yep, I am open for projects. Reach out via email to discuss
                    your needs.
                  </Text>
                </AccordionCard>

                <AccordionCard
                  title="Do I own the final work?"
                  variant="secondary"
                >
                  <Text as="p" variant="secondary">
                    Yes! All Tier 2 deliverables come with full ownership and
                    unlimited usage rights. You can modify and reuse the files
                    for future events.
                  </Text>
                </AccordionCard>
              </Grid>
            </Flex>

            {/* CTA SECTION */}
            <Flex
              alignItems="start"
              as="section"
              css={{ alignSelf: 'stretch' }}
              direction="column"
              gap="5"
            >
              <H2>Let&apos;s Create Something Together</H2>
              <Card variant="tertiary">
                <Card.Body>
                  <Flex direction="column" gap="4">
                    <Text as="p" variant="secondary">
                      Interested in working together? I&apos;d love to hear
                      about your project and explore how we can collaborate.
                    </Text>
                    <Flex direction="column" gap="2">
                      <Text as="p" variant="secondary">
                        Email:{' '}
                        <Anchor
                          href="mailto:contact@data-v.site"
                          discreet={false}
                        >
                          contact@data-v.site
                        </Anchor>
                      </Text>
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
