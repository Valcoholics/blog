import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import type { OutlineEntry } from '@core/components/DynamicTOC/GroupedTOC';

import { MediaControls, PlayerIcon } from './MediaControls';
import { createLandscapeOrientation } from './landscapeOrientation';
import { MezameThreadedVideoTextureBridge } from './MezameThreadedVideoTextureBridge';
import { ReadingPassage, type ReadingLayout } from './ReadingPassage';
import { portraitMedia, storyParagraphs, type PortraitClip } from './storyContent';
import { useSceneSnap } from './useSceneSnap';
import styles from './MezameStory.module.css';

const MEDIA_BASE = 'https://pub-556a716225174d179e339095133d37c3.r2.dev/mezame';
const HOLD = 0.3;

type Clip = { filename: string; id: string; label: string; duration: number };

const durations = [
  18.6, 34.7, 32.8667, 61.6954, 118.6, 57.9333, 32.2667, 107.4333, 145.1667,
  128.8, 23.6333, 16.2333, 14.4667, 73.4667, 282.4667, 36.6667, 48.1667,
];

type Passage = {
  id: string;
  title: string;
  layout: ReadingLayout;
  children: ReactNode;
  media?: PortraitClip[];
  defaultRecordingId?: string;
};

// These ranges retain the approved manuscript's paragraph order. Multiple BTS
// recordings share a reading composition rather than adding empty scroll stops.
const introduction: Passage[] = [
  { id: 'arrival', title: 'Arriving at St. Bartholomew’s', layout: 'portrait',
    children: storyParagraphs.slice(3, 9), media: portraitMedia.arrival, defaultRecordingId: 'bts-079' },
  { id: 'behind-the-scenes', title: 'Working with the crew', layout: 'portrait',
    children: storyParagraphs.slice(9, 13), media: portraitMedia.crew },
  { id: 'lighting', title: 'Lighting the arches', layout: 'portrait',
    children: storyParagraphs.slice(13, 16), media: portraitMedia.lighting, defaultRecordingId: 'bts-098-01' },
  { id: 'projection-mapping', title: 'Mapping the architecture', layout: 'portrait',
    children: storyParagraphs[16], media: portraitMedia.mapping },
];

const passages: Record<number, Passage[]> = {
  0: [{ id: 'art-and-architecture', title: 'Art, light, and architecture', layout: 'fullscreen',
    children: storyParagraphs.slice(17, 19) }],
  4: [
    { id: 'visual-artists', title: 'Meeting the visual artists', layout: 'panel', children: storyParagraphs[19] },
    { id: 'saturday', title: 'Returning for Saturday', layout: 'portrait',
      children: storyParagraphs.slice(20, 23), media: portraitMedia.saturday },
    { id: 'scraaatch', title: 'SCRAAATCH', layout: 'portrait',
      children: storyParagraphs.slice(23, 25), media: portraitMedia.scraaatch },
  ],
  7: [{ id: 'following-the-performance', title: 'Following the performance', layout: 'panel', children: storyParagraphs[25] }],
  11: [{ id: 'skee-mask', title: 'Skee Mask', layout: 'portrait',
    children: storyParagraphs[26], media: portraitMedia.skeeMask }],
  13: [{ id: 'staying-with-it', title: 'Staying with the set', layout: 'panel', children: storyParagraphs[27] }],
};

// Full-length original 4K exports, kept in capture order. Their editorial
// titles and contexts will arrive from the media catalog instead of being guessed here.
const clips: Clip[] = [
  ['VID_20260926_181610_013_clip-01.mp4', '013 / 01'],
  ['VID_20260926_181610_013_clip-02.mp4', '013 / 02'],
  ['VID_20260926_181610_014.mp4', '014'],
  ['VID_20260926_181610_015.mp4', '015'],
  ['VID_20260926_181610_035.mp4', '035'],
  ['VID_20260926_181610_039_clip_01.mp4', '039 / 01'],
  ['VID_20260926_181610_039_clip_02.mp4', '039 / 02'],
  ['VID_20260926_181610_039_clip_03.mp4', '039 / 03'],
  ['VID_20260926_181610_040_clip_01.mp4', '040 / 01'],
  ['VID_20260926_181610_040_clip_02.mp4', '040 / 02'],
  ['VID_20260926_181610_051.mp4', '051'],
  ['VID_20260926_181610_059.mp4', '059'],
  ['VID_20260926_181610_064_clip_01.mp4', '064 / 01'],
  ['VID_20260926_181610_064_clip_02.mp4', '064 / 02'],
  ['VID_20260926_181610_067.mp4', '067'],
  ['VID_20260926_181610_076_clip_01.mp4', '076 / 01'],
  ['VID_20260926_181610_076_clip_02.mp4', '076 / 02'],
].map(([filename, id], index) => ({
  filename,
  id,
  label: `Recording ${id}`,
  duration: durations[index],
}));

type VideoState = {
  loaded: boolean;
  paused: boolean;
  progress: number;
  time: { current: number; duration: number };
  toggle: () => void;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function formatClock(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

const recordingLinks = clips.map((clip, index) => ({
  id: `recording-${index + 1}`,
  title: clip.label,
  duration: formatClock(clip.duration),
}));

export const mezameOutline: OutlineEntry[] = [
  ...introduction.map((passage) => ({
    id: passage.id, title: passage.title,
    clips: passage.media?.map((clip) => ({ ...clip, duration: formatClock(clip.duration) })),
  })),
  { id: 'inside-the-room', title: 'Art, light, and architecture', clips: recordingLinks.slice(0, 4) },
  { id: 'visual-artists', title: 'Meeting the visual artists', clips: recordingLinks.slice(4, 5) },
  { id: 'saturday', title: 'Returning for Saturday', clips: portraitMedia.saturday.map((clip) => ({ ...clip, duration: formatClock(clip.duration) })) },
  { id: 'scraaatch', title: 'SCRAAATCH', clips: [
    ...portraitMedia.scraaatch.map((clip) => ({ ...clip, duration: formatClock(clip.duration) })),
    ...recordingLinks.slice(5, 10),
  ] },
  { id: 'recording-11', title: 'More from the evening', clips: recordingLinks.slice(10, 12) },
  { id: 'skee-mask', title: 'Skee Mask', clips: [
    ...portraitMedia.skeeMask.map((clip) => ({ ...clip, duration: formatClock(clip.duration) })),
    ...recordingLinks.slice(12, 15),
  ] },
  { id: 'recording-16', title: 'Later in the night', clips: recordingLinks.slice(15) },
  { id: 'reflection', title: 'Sharing the night', clips: [] },
];

function usePooledVideo(
  video: HTMLVideoElement | null,
  src: string | null,
  playing: boolean,
  muted: boolean
): VideoState {
  const attached = useRef<{ element: HTMLVideoElement; src: string } | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    if (!video || !src) {
      setLoaded(false);
      return;
    }
    const prior = attached.current;
    if (prior?.element === video && prior.src === src) {
      if (video.readyState >= 2) setLoaded(true);
      return;
    }

    attached.current = { element: video, src };
    setLoaded(false);
    setProgress(0);
    setTime({ current: 0, duration: 0 });
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.loop = false;

    const onLoaded = () => setLoaded(true);
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onTime = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      setProgress(duration > 0 ? video.currentTime / duration : 0);
      setTime({ current: video.currentTime, duration });
    };
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.src = src;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
    };
  }, [src, video]);

  useEffect(() => {
    if (!video) return;
    video.muted = muted;
    video.volume = 1;
  }, [muted, video]);

  useEffect(() => {
    if (!video || !src) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [loaded, playing, src, video]);

  const toggle = useCallback(() => {
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [video]);

  return { loaded, paused, progress, time, toggle };
}

export function MezameStory() {
  const [videoA, setVideoA] = useState<HTMLVideoElement | null>(null);
  const [videoB, setVideoB] = useState<HTMLVideoElement | null>(null);
  const [journey, setJourney] = useState(0);
  const [position, setPosition] = useState({ pairIndex: 0, local: 0 });
  const [inView, setInView] = useState(false);
  const [landscapeReady, setLandscapeReady] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [reading, setReading] = useState(false);
  const [readingLayout, setReadingLayout] = useState<ReadingLayout | null>(null);
  const [activePassage, setActivePassage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [committedIndex, setCommittedIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<number | null>(null);
  const [landscapeOrientation] = useState(createLandscapeOrientation);
  const leadRef = useRef<HTMLVideoElement | null>(null);
  const nextRef = useRef<HTMLVideoElement | null>(null);

  useSceneSnap(railRef, fullscreenScrollRef, reducedMotion);

  const { local, pairIndex } = position;
  const outgoing = clips[pairIndex] ?? null;
  const incoming = clips[pairIndex + 1] ?? null;
  const swapped = pairIndex % 2 === 1;
  const lead = swapped ? videoB : videoA;
  const next = swapped ? videoA : videoB;
  leadRef.current = lead;
  nextRef.current = next;
  const clipForA = swapped ? incoming : outgoing;
  const clipForB = swapped ? outgoing : incoming;
  const requestedIncoming = incoming !== null && local > 0.5;
  const portraitReading = readingLayout === 'portrait';
  const seamRequested = incoming !== null && local > HOLD && local < 1 - HOLD;
  const leadPlaying = inView && !portraitReading && (!requestedIncoming || seamRequested);
  const nextPlaying =
    inView && !portraitReading && incoming !== null && (requestedIncoming || seamRequested);

  const stateA = usePooledVideo(
    videoA,
    landscapeReady && clipForA ? `${MEDIA_BASE}/${clipForA.filename}` : null,
    swapped ? nextPlaying : leadPlaying,
    !soundOn || portraitReading || (swapped ? !requestedIncoming : requestedIncoming)
  );
  const stateB = usePooledVideo(
    videoB,
    landscapeReady && clipForB ? `${MEDIA_BASE}/${clipForB.filename}` : null,
    swapped ? leadPlaying : nextPlaying,
    !soundOn || portraitReading || (swapped ? requestedIncoming : !requestedIncoming)
  );
  const leadState = swapped ? stateB : stateA;
  const nextState = swapped ? stateA : stateB;
  const requestedIndex = requestedIncoming ? pairIndex + 1 : pairIndex;
  const requestedState = requestedIncoming ? nextState : leadState;
  const activeIndex = requestedState.loaded ? requestedIndex : committedIndex;
  const activeIsIncoming = activeIndex === pairIndex + 1;
  const activeState = activeIsIncoming ? nextState : leadState;
  const activeClip = clips[activeIndex] ?? clips[0];
  const weaving =
    inView && !stacked && !portraitReading && !reducedMotion && seamRequested && leadState.loaded && nextState.loaded;

  useEffect(() => {
    if (requestedState.loaded) setCommittedIndex(requestedIndex);
  }, [requestedIndex, requestedState.loaded]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px), (max-aspect-ratio: 6 / 5)');
    const update = () => setStacked(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    // Deep links should land on the same composition as a scroll or outline link.
    const alignHash = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      const stackedPortrait = target?.hasAttribute('data-portrait-recording') &&
        window.matchMedia('(max-width: 800px), (max-aspect-ratio: 6 / 5)').matches;
      const composition = stackedPortrait ? target : target?.closest('[data-scene-snap]');
      composition?.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    };
    const frame = window.requestAnimationFrame(alignHash);
    window.addEventListener('hashchange', alignHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', alignHash);
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let animationFrame = 0;
    const measure = () => {
      animationFrame = 0;
      if (fullscreenScrollRef.current !== null || document.fullscreenElement) return;
      const bounds = rail.getBoundingClientRect();
      const top = window.scrollY + bounds.top;
      const total = Math.max(1, rail.offsetHeight - window.innerHeight);
      setJourney(clamp01((window.scrollY - top) / total));
      setInView(
        bounds.top < window.innerHeight * 0.35 &&
          bounds.bottom > window.innerHeight * 0.5
      );

      const stops = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-clip-stop]')
      );
      // The long portrait introduction should not preload two landscape files.
      // Warm the pool only as readers approach the first performance scene.
      if (stops[0]?.getBoundingClientRect().top < window.innerHeight * 1.5) {
        setLandscapeReady(true);
      }
      let index = 0;
      stops.forEach((stop, i) => {
        if (stop.getBoundingClientRect().top <= 1) index = i;
      });
      const stop = stops[index];
      const passage = Array.from(rail.querySelectorAll<HTMLElement>('[data-reading]'))
        .find((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top <= window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
        });
      setReading(!!passage);
      setActivePassage(passage?.id ?? null);
      setReadingLayout((passage?.dataset.readingLayout as ReadingLayout) ?? null);

      const transition = stop?.querySelector<HTMLElement>('[data-handoff]');
      const progress = transition
        ? clamp01(
            -transition.getBoundingClientRect().top / transition.offsetHeight
          )
        : 0;
      const nextPosition =
        index === clips.length - 1
          ? { pairIndex: index - 1, local: 1 }
          : {
              pairIndex: index,
              local: progress > 0 ? HOLD + progress * (1 - 2 * HOLD) : 0,
            };
      setPosition((previous) =>
        previous.pairIndex === nextPosition.pairIndex &&
        previous.local === nextPosition.local
          ? previous
          : nextPosition
      );
    };
    const onScroll = () => {
      if (!animationFrame)
        animationFrame = window.requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const continueStory = () => {
    const target = Array.from(
      railRef.current?.querySelectorAll<HTMLElement>('[data-scene-snap]') ?? []
    ).find((scene) => scene.getBoundingClientRect().top > 4)
      ?? document.getElementById('mezame-afterword');
    if (!target) return;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  };

  const togglePlayback = () => activeState.toggle();
  const toggleSound = () => {
    const enabled = !soundOn;
    const element = activeIsIncoming ? next : lead;
    // Apply unmuting during the click gesture, including browsers that require it.
    for (const video of [videoA, videoB]) {
      if (video) video.muted = !enabled || video !== element;
    }
    setSoundOn(enabled);
  };
  const replay = () => {
    const element = activeIsIncoming ? next : lead;
    if (!element) return;
    element.currentTime = 0;
    element.play().catch(() => {});
  };

  useEffect(() => {
    let restoreFrame = 0;
    const restore = () => {
      landscapeOrientation.release();
      setIsFullscreen(false);
      if (fullscreenScrollRef.current !== null) {
        const scrollY = fullscreenScrollRef.current;
        restoreFrame = window.requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
          fullscreenScrollRef.current = null;
        });
      }
    };
    const update = () => {
      const active = document.fullscreenElement === stageRef.current;
      setIsFullscreen(active);
      if (!active) restore();
    };
    const beginNative = () => setIsFullscreen(true);
    const videos = [videoA, videoB];
    videos.forEach((video) => {
      video?.addEventListener('webkitbeginfullscreen', beginNative);
      video?.addEventListener('webkitendfullscreen', restore);
    });
    document.addEventListener('fullscreenchange', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      videos.forEach((video) => {
        video?.removeEventListener('webkitbeginfullscreen', beginNative);
        video?.removeEventListener('webkitendfullscreen', restore);
      });
      window.cancelAnimationFrame(restoreFrame);
      landscapeOrientation.release();
    };
  }, [videoA, videoB, landscapeOrientation]);

  const toggleFullscreen = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const video = (activeIsIncoming ? next : lead) as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
    }) | null;
    setFullscreenError('');
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else if (isFullscreen && video?.webkitExitFullscreen) video.webkitExitFullscreen();
      else {
        fullscreenScrollRef.current = window.scrollY;
        if (stage.requestFullscreen) {
          try { await stage.requestFullscreen(); }
          catch (error) {
            if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
            else throw error;
          }
        } else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else throw new Error('Fullscreen unavailable');
        if (document.fullscreenElement === stage && window.matchMedia('(pointer: coarse)').matches) {
          await landscapeOrientation.request(window.screen.orientation);
        }
      }
    } catch {
      if (document.fullscreenElement !== stage)
        fullscreenScrollRef.current = null;
      setFullscreenError('Fullscreen is unavailable in this browser.');
    }
  };

  return (
    <div className={styles.story}>
      <div className={styles.opening}>
        {storyParagraphs.slice(0, 3)}
        <p className={styles.readingGuide}>
          This field note moves between writing and full-length clips. Stop
          scrolling whenever you want to watch; each clip plays in its own time.
        </p>
        <a className={styles.enterStory} href="#arrival">
          Begin the story ↓
        </a>
      </div>
      <a className={styles.skip} href="#mezame-afterword">
        Skip the media experience
      </a>
      <div className={styles.mediaExperience} ref={railRef}>
        <div
          className={styles.stage}
          data-reading-layout={readingLayout ?? undefined}
          ref={stageRef}
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (!portraitReading && !target.closest('button, a')) togglePlayback();
          }}
        >
          <div className={styles.mediaFrame}>
          <div className={styles.visuals} hidden={portraitReading}
            data-presence={readingLayout === 'fullscreen' && !isFullscreen ? 'dimmed' : 'full'}>
          <video
            ref={setVideoA}
            aria-hidden={swapped ? !activeIsIncoming : activeIsIncoming}
            className={styles.video}
            style={{
              opacity: swapped
                ? activeIsIncoming
                  ? 1
                  : 0
                : activeIsIncoming
                  ? 0
                  : 1,
            }}
          />
          <video
            ref={setVideoB}
            aria-hidden={swapped ? activeIsIncoming : !activeIsIncoming}
            className={styles.video}
            style={{
              opacity: swapped
                ? activeIsIncoming
                  ? 0
                  : 1
                : activeIsIncoming
                  ? 1
                  : 0,
            }}
          />
          {outgoing && incoming && (
            <MezameThreadedVideoTextureBridge
              active={weaving}
              fromVideoElRef={leadRef}
              fromSrc={`${MEDIA_BASE}/${outgoing.filename}`}
              progress={easeInOut(clamp01((local - HOLD) / (1 - 2 * HOLD)))}
              toVideoElRef={nextRef}
              toSrc={`${MEDIA_BASE}/${incoming.filename}`}
            />
          )}
          </div>
          {!portraitReading && !isFullscreen && (
            <button type="button" className={styles.fullscreenPrompt} onClick={toggleFullscreen}>
              <PlayerIcon type="fullscreen" /> Full screen
            </button>
          )}
          </div>
          {!portraitReading && <>
          {!leadState.loaded && !nextState.loaded && (
            <p className={styles.loading}>Preparing footage…</p>
          )}

          <span className={styles.playbackTime} aria-label="Playback time">
            {formatClock(activeState.time.current)} /{' '}
            {formatClock(activeState.time.duration || activeClip.duration)}
          </span>
          <div
            className={styles.durationProgress}
            aria-label="Current clip progress"
          >
            <span style={{ transform: `scaleX(${activeState.progress})` }} />
          </div>
          <div className={styles.threadProgress} aria-hidden="true">
            <span style={{ transform: `scaleX(${journey})` }} />
          </div>

          <MediaControls
            className={styles.controls}
            paused={activeState.paused}
            soundOn={soundOn}
            fullscreen={isFullscreen}
            separateFullscreen={!isFullscreen}
            onPlayback={togglePlayback}
            onSound={toggleSound}
            onReplay={replay}
            onFullscreen={toggleFullscreen}
          />
          </>}
          {!isFullscreen && !portraitReading && (
            <button
              className={styles.continueStory}
              type="button"
              onClick={continueStory}
            >
              {passages[activeIndex] && !reading
                ? 'Continue reading ↓'
                : activeIndex === clips.length - 1
                  ? 'Continue the post ↓'
                  : 'Next recording ↓'}
            </button>
          )}
          {fullscreenError && (
            <p className={styles.controlMessage} role="status">
              {fullscreenError}
            </p>
          )}
        </div>

        <div className={styles.scrollRail}>
          {introduction.map((passage, index) => (
            <ReadingPassage
              key={passage.id}
              {...passage}
              active={activePassage === `${passage.id}-section`}
              nextRecordingId={introduction[index + 1]?.id ?? 'inside-the-room'}
            />
          ))}
          {clips.map((clip, index) => (
            <div
              key={clip.filename}
              data-clip-stop={index}
            >
              <section
                data-scene-snap="watch"
                id={
                  index === 0
                    ? 'inside-the-room-section'
                    : `recording-${index + 1}-section`
                }
                aria-label={clip.label}
                className={styles.watchStop}
              >
                <span id={`recording-${index + 1}`} />
                <div className={styles.annotation}>
                  {index === 0 ? (
                    <h2 id="inside-the-room">Inside the room</h2>
                  ) : (
                    <p className={styles.annotationTitle}>{clip.label}</p>
                  )}
                </div>
              </section>
              {passages[index]?.map((passage, passageIndex) => (
                <ReadingPassage
                  key={passage.id}
                  {...passage}
                  active={activePassage === `${passage.id}-section`}
                  nextRecordingId={passages[index][passageIndex + 1]?.id ??
                    (index < clips.length - 1 ? `recording-${index + 2}` : 'reflection')}
                />
              ))}
              {index < clips.length - 1 && (
                <div
                  data-handoff
                  className={styles.handoff}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.afterword} id="mezame-afterword">
        <h2 id="reflection">Sharing the night</h2>
        {storyParagraphs.slice(28)}
        <a href="/posts/ambient-church/">
          Read my first Ambient Church field note →
        </a>
      </div>
    </div>
  );
}
