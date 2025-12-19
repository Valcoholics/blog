import { styled } from '@maximeheckel/design-system';

export const EmbedWrapper = styled('div', {
  position: 'relative',
  paddingBottom: '56.25%',
  height: 0,
  overflow: 'hidden',
  margin: '2rem 0',
  borderRadius: 'var(--border-radius-3)',
  border: '2px solid var(--border-color)',
  background: 'var(--foreground)',
});

export const EmbedIframe = styled('iframe', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 'none',
});
