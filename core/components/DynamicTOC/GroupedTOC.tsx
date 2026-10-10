import React, { useId, useState } from 'react';

import styles from './GroupedTOC.module.css';

export type OutlineEntry = {
  id: string;
  title: string;
  clips?: Array<{ id: string; title: string; duration: string }>;
};

export const GroupedTOC = ({
  entries,
  onNavigate,
}: {
  entries: OutlineEntry[];
  onNavigate: () => void;
}) => {
  const instanceId = useId();
  const [openId, setOpenId] = useState<string | null>(
    () => entries.find((entry) => entry.clips?.length)?.id ?? null
  );

  const navigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    recording = false
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const target = document.getElementById(id);
    if (recording) {
      window.dispatchEvent(new CustomEvent('mezame:select-recording', { detail: { id } }));
    }
    const stackedPortrait = target?.hasAttribute('data-portrait-recording') &&
      window.matchMedia('(max-width: 800px), (max-aspect-ratio: 6 / 5)').matches;
    const composition = stackedPortrait ? target : target?.closest('[data-scene-snap]') ?? target;
    composition?.scrollIntoView({
      behavior: recording ? 'instant' : reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    onNavigate();
  };

  return (
    <nav
      aria-label="Post outline"
      className={styles.outline}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') event.stopPropagation();
      }}
    >
      <ul className={styles.groups}>
        {entries.map((entry) => {
          const expanded = openId === entry.id;
          const listId = `${instanceId}-${entry.id}-recordings`;
          return (
            <li key={entry.id} className={styles.group}>
              <div className={styles.heading}>
                <a href={`#${entry.id}`} onClick={(e) => navigate(e, entry.id)}>
                  {entry.title}
                </a>
                {!!entry.clips?.length && (
                  <button
                    type="button"
                    aria-label={`${expanded ? 'Hide' : 'Show'} recordings for ${entry.title}`}
                    aria-expanded={expanded}
                    aria-controls={listId}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenId(expanded ? null : entry.id);
                    }}
                  >
                    <span>{entry.clips.length} {entry.clips.length === 1 ? 'clip' : 'clips'}</span>
                    <span aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
                  </button>
                )}
              </div>
              {!!entry.clips?.length && (
                <ul id={listId} className={styles.clips} hidden={!expanded}>
                  {entry.clips.map((clip) => (
                    <li key={clip.id}>
                      <a
                        href={`#${clip.id}`}
                        onClick={(event) => navigate(event, clip.id, true)}
                      >
                        <span>{clip.title}</span>
                        <span className={styles.duration}>{clip.duration}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
