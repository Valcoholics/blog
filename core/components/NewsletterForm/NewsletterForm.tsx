import {
  Button,
  Card,
  Flex,
  List,
  Text,
  TextInput,
  EM,
  Box,
} from '@maximeheckel/design-system';
import React from 'react';

import Glow from '@core/components/Glow';

import { NewsletterHeader } from './Icons';
import { NewsletterFormContent, ErrorMessage } from './Styles';
import { subscribeCall } from './utils';

interface Props {
  large?: boolean;
}

const NewsletterForm = (props: Props) => {
  const { large = false } = props;
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const subscribe = async (data: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await subscribeCall(data);
      setIsSuccess(true);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      depth={1}
      style={{
        marginLeft: '-var(--space-1)',
        marginRight: '-var(--space-1)',
      }}
    >
      {large ? (
        <Flex
          justifyContent="center"
          css={{
            paddingTop: 'var(--space-8)',
          }}
        >
          <NewsletterHeader />
        </Flex>
      ) : null}
      <NewsletterFormContent withOffset={large}>
        {large ? (
          <Text
            as="h3"
            size="5"
            weight="3"
            css={{
              maxWidth: '600px',
            }}
          >
            Get a behind the scenes look at what I&apos;m currently learning,
            exploring, and creating.
          </Text>
        ) : (
          <Text
            as="h3"
            size="5"
            weight="3"
            css={{
              maxWidth: '600px',
            }}
          >
            Subscribe to my newsletter
          </Text>
        )}
        {large ? (
          <>
            <Text
              as="p"
              css={{
                marginBottom: '0px',
              }}
              variant="secondary"
            >
              Subscribe to my newsletter to receive a monthly digest containing:
            </Text>
            <List variant="unordered">
              <List.Item>
                <Text
                  as="p"
                  css={{
                    marginBottom: '0px',
                  }}
                  variant="secondary"
                >
                  Deep dives into some of my <EM>ideas and secret projects</EM>{' '}
                  that will inspire you
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="p"
                  css={{
                    marginBottom: '0px',
                  }}
                  variant="secondary"
                >
                  <EM>Exclusive previews of upcoming articles</EM> on frontend
                  development, React, Shaders, React Three Fiber and more.
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="p"
                  css={{
                    marginBottom: '0px',
                  }}
                  variant="secondary"
                >
                  Some of my <EM>favorite resources and tips</EM> on frontend
                  development or anything I&apos;m currently interested in to
                  further expand your skillset as a developer
                </Text>
              </List.Item>
            </List>
          </>
        ) : null}
        <Box
          as="form"
          css={{ width: '100%', maxWidth: '400px' }}
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await subscribe({ email });
            } catch (e) {}
          }}
        >
          <Box css={{ position: 'relative', width: '100%' }}>
            <TextInput
              aria-label="Email"
              id="email-input"
              type="email"
              placeholder="your@email.com"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <Box
              css={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <Glow>
                <Button
                  aria-label="Subscribe to my newsletter"
                  disabled={isLoading || isSuccess}
                  title="Subscribe to my newsletter"
                  type="submit"
                  variant="primary"
                  css={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? '...' : isSuccess ? '✓' : '>'}
                </Button>
              </Glow>
            </Box>
          </Box>
        </Box>
        {error ? (
          error.message.includes('already subscribed') ? (
            <ErrorMessage>
              Looks like you&apos;re already subscribed! Check your inbox for updates.
            </ErrorMessage>
          ) : (
            <ErrorMessage>
              😬 Oops! Something went wrong. Please try again in a moment.
            </ErrorMessage>
          )
        ) : null}
        {isSuccess ? (
          <Text
            as="p"
            css={{
              margin: '16px 0px 0px 0px',
              textAlign: 'center',
            }}
          >
            (You will receive a confirmation email in a few seconds)
          </Text>
        ) : null}
      </NewsletterFormContent>
    </Card>
  );
};

export default NewsletterForm;
