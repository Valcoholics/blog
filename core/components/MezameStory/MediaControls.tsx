import styles from './MediaControls.module.css';

type IconType = 'play' | 'pause' | 'muted' | 'sound' | 'replay' | 'fullscreen' | 'exit';

export function PlayerIcon({ type }: { type: IconType }) {
  const paths = {
    play: 'M8 5l11 7-11 7Z',
    pause: 'M8 5v14M16 5v14',
    muted: 'M11 5L6 9H3v6h3l5 4ZM16 9l6 6M22 9l-6 6',
    sound: 'M11 5L6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
    replay: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
    fullscreen: 'M9 3H3v6M15 3h6v6M21 15v6h-6M9 21H3v-6',
    exit: 'M3 9h6V3M15 3v6h6M21 15h-6v6M9 21v-6H3',
  };
  return <svg className={styles.icon} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={paths[type]} /></svg>;
}

export function MediaControls({ className, paused, soundOn, fullscreen, disabled = false, separateFullscreen = false, onPlayback, onSound, onReplay, onFullscreen }: {
  className: string;
  paused: boolean;
  soundOn: boolean;
  fullscreen: boolean;
  disabled?: boolean;
  separateFullscreen?: boolean;
  onPlayback: () => void;
  onSound: () => void;
  onReplay: () => void;
  onFullscreen: () => void;
}) {
  return (
    <div className={`${styles.actions} ${className}`} role="group" aria-label="Video controls" data-media-controls>
      <button type="button" onClick={onPlayback} disabled={disabled} title={paused ? 'Play' : 'Pause'}><PlayerIcon type={paused ? 'play' : 'pause'} /><span className={styles.label}>{paused ? 'Play' : 'Pause'}</span></button>
      <button type="button" onClick={onSound} aria-pressed={soundOn} title={soundOn ? 'Sound on' : 'Sound off'}><PlayerIcon type={soundOn ? 'sound' : 'muted'} /><span className={styles.label}>{soundOn ? 'Sound on' : 'Sound off'}</span></button>
      <button type="button" onClick={onReplay} disabled={disabled} title="Replay"><PlayerIcon type="replay" /><span className={styles.label}>Replay</span></button>
      <button type="button" onClick={onFullscreen} aria-pressed={fullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} className={separateFullscreen ? styles.separateFullscreen : undefined}><PlayerIcon type={fullscreen ? 'exit' : 'fullscreen'} /><span className={styles.label}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span></button>
    </div>
  );
}
