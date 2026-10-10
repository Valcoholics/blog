import type { ReactNode } from 'react';

import H2 from '@core/components/H2';

import { PortraitVideo, type PortraitRecording } from './PortraitVideo';
import styles from './ReadingPassage.module.css';

export type ReadingLayout = 'panel' | 'fullscreen' | 'portrait';

type ReadingPassageProps = {
  id: string;
  title: string;
  text?: string;
  children?: ReactNode;
  layout: ReadingLayout;
  nextRecordingId?: string;
  media?: PortraitRecording[];
  defaultRecordingId?: string;
  active?: boolean;
};

export function ReadingPassage({
  id,
  title,
  text,
  children,
  layout,
  nextRecordingId,
  media,
  defaultRecordingId,
  active = false,
}: ReadingPassageProps) {
  const prose = (
    <div className={styles.prose}>
      <H2 id={id}>{title}</H2>
      {children ?? (text ? <p>{text}</p> : null)}
    </div>
  );
  const continuation = nextRecordingId ? (
    <a className={styles.continueStory} href={`#${nextRecordingId}`}>
      Continue the story ↓
    </a>
  ) : null;

  return (
    <section
      id={`${id}-section`}
      aria-labelledby={id}
      className={`${styles.section} ${styles[layout]}`}
      data-reading
      data-scene-snap="reading"
      data-reading-layout={layout}
    >
      {layout === 'portrait' ? (
        <>
          <div className={styles.portraitCopy} data-mobile-snap="reading">
            {prose}
            {continuation}
          </div>
          <div className={styles.portraitWatch} data-mobile-snap="watch">
            <div className={styles.portraitMedia}>
              {media?.length ? (
                <PortraitVideo media={media} active={active} defaultRecordingId={defaultRecordingId} />
              ) : (
                <div className={styles.portraitPlaceholder} role="img" aria-label="9 by 16 portrait video placeholder. No vertical media supplied.">
                  <span>9:16</span>
                  <strong>Portrait video placeholder</strong>
                  <small>No vertical media supplied</small>
                </div>
              )}
            </div>
            {continuation && (
              <div className={styles.mobileContinuation}>{continuation}</div>
            )}
          </div>
        </>
      ) : (
        prose
      )}
    </section>
  );
}

export default ReadingPassage;
