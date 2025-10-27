import { styled, Card, Text } from '@maximeheckel/design-system';
import React from 'react';

export const NewsletterFormContent = styled(Card.Body, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-2)',
  variants: {
    withOffset: {
      true: {
        padding: '32px',
        '@media (max-width: 700px)': {
          padding: '32px 20px 24px 20px',
        },
      },
      false: {
        padding: '16px',
      },
    },
  },
});

export const ErrorMessage = (props: { children: React.ReactNode }) => (
  <Text
    as="p"
    css={{
      margin: '16px 0px 0px 0px',
      maxWidth: '800px !important',
    }}
    variant="danger"
  >
    {props.children}
  </Text>
);
