import { styled, Flex } from '@maximeheckel/design-system';

import { HR } from '@core/components/HR';

const StyledSection = styled('section', {
  background: 'var(--background)',
  color: 'var(--text-primary)',
  paddingBottom: 48,
  width: '100%',

  '@media (max-width: 700px)': {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
});

const Footnote = ({ title, url }: { title: string; url: string }) => {

  return (
    <StyledSection data-testid="footnote">
      <Flex
        alignItems="start"
        direction="column"
        css={{
          maxWidth: 700,
          margin: '0 auto',
        }}
        gap="5"
      >
        <HR />
      </Flex>
    </StyledSection>
  );
};

export { Footnote };
