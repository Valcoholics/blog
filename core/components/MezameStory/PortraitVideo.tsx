import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { MediaControls } from './MediaControls';
import styles from './PortraitVideo.module.css';

export type PortraitRecording = {
  id: string;
  src: string;
  title: string;
  duration: number;
};

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

export function PortraitVideo({ media, active, defaultRecordingId }: {
  media: PortraitRecording[];
  active: boolean;
  defaultRecordingId?: string;
}) {
  const [selectedId, setSelectedId] = useState(() =>
    media.find(({ id }) => id === defaultRecordingId)?.id ?? media[0]?.id
  );
  const [visible, setVisible] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const positions = useRef(new Map<string, number>());
  const wantsPlay = useRef(true);
  const fullscreenScroll = useRef<{ x: number; y: number } | null>(null);
  const selectId = useId();
  const selected = media.find(({ id }) => id === selectedId) ?? media[0];
  // On phones the video follows the copy. Keep its controls usable until the
  // player leaves the screen, even after the next passage crosses the midpoint.
  const enabled = ((stacked || active) && visible) || fullscreen;

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    setMessage('');
    video.play().catch((error: DOMException) => {
      if (error.name !== 'AbortError') setMessage('Press Play to begin.');
    });
  }, [enabled]);

  const selectRecording = useCallback((id: string) => {
    if (!media.some((recording) => recording.id === id)) return;
    wantsPlay.current = true;
    positions.current.set(id, 0);
    setEnded(false);
    setMessage('');
    if (selected?.id === id) {
      const video = videoRef.current;
      if (video && video.readyState > 0) video.currentTime = 0;
      play();
    } else {
      setSelectedId(id);
    }
  }, [media, play, selected?.id]);
  const selectionHandler = useRef(selectRecording);
  selectionHandler.current = selectRecording;

  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px), (max-aspect-ratio: 6 / 5)');
    const update = () => setStacked(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.05);
    }, { threshold: [0, 0.05] });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const readHash = () => {
      let id = window.location.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Keep a literal malformed hash. */ }
      selectionHandler.current(id);
    };
    const onSelection = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (typeof id === 'string') selectionHandler.current(id);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    window.addEventListener('mezame:select-recording', onSelection);
    return () => {
      window.removeEventListener('hashchange', readHash);
      window.removeEventListener('mezame:select-recording', onSelection);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selected || !enabled) return;
    let cancelled = false;
    const savedTime = positions.current.get(selected.id) ?? 0;
    setTime(savedTime);
    setDuration(selected.duration);
    setMessage('');
    const start = () => {
      if (cancelled) return;
      if (Number.isFinite(video.duration)) setDuration(video.duration);
      if (savedTime > 0) video.currentTime = Math.min(savedTime, video.duration || savedTime);
      if (wantsPlay.current) {
        video.play().catch((error: DOMException) => {
          if (!cancelled && error.name !== 'AbortError') setMessage('Press Play to begin.');
        });
      }
    };
    video.addEventListener('loadedmetadata', start, { once: true });
    video.src = selected.src;
    video.load();
    return () => {
      cancelled = true;
      positions.current.set(selected.id, video.currentTime || savedTime);
      video.removeEventListener('loadedmetadata', start);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [enabled, selected?.id, selected?.src, selected?.duration]);

  useEffect(() => {
    let restoreFrame = 0;
    const restore = () => {
      const scroll = fullscreenScroll.current;
      fullscreenScroll.current = null;
      restoreFrame = window.requestAnimationFrame(() => {
        if (scroll) window.scrollTo({ left: scroll.x, top: scroll.y, behavior: 'instant' as ScrollBehavior });
        setFullscreen(false);
      });
    };
    const update = () => {
      if (document.fullscreenElement === playerRef.current) setFullscreen(true);
      else if (fullscreenScroll.current) restore();
    };
    const video = videoRef.current;
    const beginNative = () => setFullscreen(true);
    document.addEventListener('fullscreenchange', update);
    video?.addEventListener('webkitbeginfullscreen', beginNative);
    video?.addEventListener('webkitendfullscreen', restore);
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      document.removeEventListener('fullscreenchange', update);
      video?.removeEventListener('webkitbeginfullscreen', beginNative);
      video?.removeEventListener('webkitendfullscreen', restore);
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    wantsPlay.current = video.paused;
    if (video.paused) play();
    else video.pause();
  }

  function replay() {
    const video = videoRef.current;
    if (!video || !selected) return;
    positions.current.set(selected.id, 0);
    if (video.readyState > 0) video.currentTime = 0;
    setTime(0);
    setEnded(false);
    wantsPlay.current = true;
    if (video.error) video.load();
    play();
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === playerRef.current) await document.exitFullscreen();
      else {
        fullscreenScroll.current = { x: window.scrollX, y: window.scrollY };
        setFullscreen(true);
        if (playerRef.current?.requestFullscreen) await playerRef.current.requestFullscreen();
        else {
          const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
          if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
          else throw new Error('Fullscreen unavailable');
        }
      }
    } catch {
      fullscreenScroll.current = null;
      setFullscreen(false);
      setMessage('Fullscreen is unavailable right now.');
    }
  }

  if (!selected) return null;

  return (
    <div className={styles.player} ref={playerRef}>
      {media.map(({ id }) => <span key={id} id={id} data-portrait-recording className={styles.recordingAnchor} aria-hidden="true" />)}
      <video
        ref={videoRef}
        className={styles.video}
        aria-label={selected.title}
        playsInline
        muted={muted}
        preload="none"
        onPlay={() => { setPaused(false); setEnded(false); setMessage(''); }}
        onPause={() => setPaused(true)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onEnded={() => { wantsPlay.current = false; setEnded(true); setPaused(true); }}
        onError={() => setMessage('This recording could not load. Use Replay to try again.')}
      />
      <div className={styles.controls}>
        {media.length > 1 ? (
          <label className={styles.recordingPicker} htmlFor={selectId}>
            <span>Recording</span>
            <select id={selectId} value={selected.id} onChange={(event) => selectRecording(event.target.value)}>
              {media.map((recording) => <option key={recording.id} value={recording.id}>{recording.title} · {clock(recording.duration)}</option>)}
            </select>
          </label>
        ) : <p className={styles.title}>{selected.title}</p>}
        <MediaControls
          className={styles.buttons}
          paused={paused}
          soundOn={!muted}
          fullscreen={fullscreen}
          disabled={!enabled}
          onPlayback={togglePlayback}
          onSound={() => { const nextMuted = !muted; if (videoRef.current) videoRef.current.muted = nextMuted; setMuted(nextMuted); }}
          onReplay={replay}
          onFullscreen={toggleFullscreen}
        />
        <div className={styles.status}>
          <span>{clock(time)} / {clock(duration || selected.duration)}</span>
          <span role="status">{message || (ended ? 'Recording ended' : '')}</span>
        </div>
      </div>
    </div>
  );
}
