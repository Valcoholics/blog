type Scene = { top: number; height: number; reading: boolean };

export function mobileSnapTarget(scenes: Scene[], start: number, y: number, height: number, gestureDelta = y - start) {
  const points = scenes.flatMap((scene) => {
    const end = scene.top + Math.max(0, scene.height - height);
    return scene.reading && end > scene.top + 6 ? [scene.top, end] : [scene.top];
  }).sort((a, b) => a - b);
  const displacement = y - start;
  if (!points.length || Math.abs(displacement) < 2) return null;
  const origin = points.findIndex((top) => Math.abs(top - start) <= 6);
  if ((y < points[0] - 4 && (origin < 0 || (origin === 0 && gestureDelta < 0))) ||
    (y > points[points.length - 1] + 4 && (origin < 0 || (origin === points.length - 1 && gestureDelta > 0)))) return null;

  // Oversized copy is freely readable, with a stop for its final screenful.
  if (scenes.some((scene) => {
    const end = scene.top + scene.height - height;
    return scene.reading && end > scene.top + 6 &&
      start >= scene.top - 6 && start <= end + 6 && y > scene.top + 6 && y < end - 6;
  })) return null;

  let target = points.reduce((nearest, top) => Math.abs(top - y) < Math.abs(nearest - y) ? top : nearest);
  if (origin >= 0 && Math.abs(gestureDelta) >= Math.min(80, height * 0.1)) {
    // A deliberate swipe advances one composition, even when momentum is large.
    target = points[origin + Math.sign(gestureDelta)] ?? target;
  }
  if (Math.abs(target - y) <= 3 || (origin < 0 && Math.abs(target - y) > height * 0.75)) return null;
  return target;
}

export function enableMobileSceneSnap(rail: HTMLElement, fullscreenScroll: { current: number | null }, reducedMotion: boolean) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let held = false;
  let nativeFullscreen = false;
  let correcting = false;
  let restingY = window.scrollY;
  let viewportWidth = window.innerWidth;
  let start: number | null = null;
  let anchor: { element: HTMLElement; end: boolean } | null = null;
  let movement = 0;
  let touchY: number | null = null;
  const cancel = () => {
    clearTimeout(timer);
    start = null;
    anchor = null;
    movement = 0;
    touchY = null;
    correcting = false;
    restingY = window.scrollY;
  };
  const fullscreen = () => nativeFullscreen || fullscreenScroll.current !== null || !!document.fullscreenElement;
  const interactive = (event: Event) => (event.target as Element | null)?.closest?.(
    'button, a, input, textarea, select, [contenteditable="true"], nav'
  );
  const elements = () => Array.from(rail.querySelectorAll<HTMLElement>(
    '[data-mobile-snap], [data-scene-snap="watch"], [data-scene-snap="reading"][data-reading-layout="panel"], [data-scene-snap="reading"][data-reading-layout="fullscreen"]'
  ));
  const scenes = (): Scene[] => elements().map((element) => ({
    top: window.scrollY + element.getBoundingClientRect().top,
    height: element.offsetHeight,
    reading: element.dataset.mobileSnap === 'reading' || element.hasAttribute('data-reading'),
  }));
  const settle = () => {
    clearTimeout(timer);
    if (held) return;
    // Follow the same scene when browser chrome resizes full-screen videos.
    const from = anchor
      ? window.scrollY + anchor.element.getBoundingClientRect().top +
        (anchor.end ? Math.max(0, anchor.element.offsetHeight - window.innerHeight) : 0)
      : start;
    start = null;
    anchor = null;
    if (from === null) {
      correcting = false;
      restingY = window.scrollY;
      return;
    }
    const y = window.scrollY;
    restingY = y;
    if (fullscreen()) return;
    const height = window.innerHeight;
    const target = mobileSnapTarget(scenes(), from, y, height, movement || undefined);
    if (target === null) return;
    correcting = true;
    restingY = target;
    window.scrollTo({ top: target, behavior: reducedMotion ? 'instant' : 'smooth' });
  };
  const queue = () => {
    clearTimeout(timer);
    if (start === null) {
      if (!correcting) restingY = window.scrollY;
      return;
    }
    timer = setTimeout(settle, 120);
  };
  const begin = (event: Event) => {
    if (interactive(event)) { cancel(); return; }
    if (start !== null || fullscreen()) return;
    start = correcting ? window.scrollY : restingY;
    movement = 0;
    for (const element of elements()) {
      const top = window.scrollY + element.getBoundingClientRect().top;
      const reading = element.dataset.mobileSnap === 'reading' || element.hasAttribute('data-reading');
      if (Math.abs(top - start) <= 6) { anchor = { element, end: false }; break; }
      if (reading && Math.abs(top + Math.max(0, element.offsetHeight - window.innerHeight) - start) <= 6) {
        anchor = { element, end: true }; break;
      }
    }
    correcting = false;
  };
  const onWheel = (event: WheelEvent) => {
    if (event.deltaY && !event.ctrlKey) {
      begin(event);
      if (start !== null) movement += event.deltaY;
    }
  };
  const onTouchStart = (event: TouchEvent) => {
    cancel();
    held = event.touches.length === 1;
    if (held) { begin(event); touchY = event.touches[0].clientY; }
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (!event.touches.length) {
      if (touchY !== null && event.changedTouches[0]) movement = touchY - event.changedTouches[0].clientY;
      touchY = null;
      held = false;
      queue();
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    cancel();
    if (['PageDown', 'PageUp', ' '].includes(event.key)) begin(event);
  };
  const onClick = (event: Event) => { if (interactive(event)) cancel(); };
  const onResize = () => {
    if (window.innerWidth !== viewportWidth) {
      viewportWidth = window.innerWidth;
      cancel();
    } else {
      // Browser chrome changes height during a swipe; preserve that intent.
      queue();
    }
  };
  const onNativeBegin = () => { nativeFullscreen = true; cancel(); };
  const onNativeEnd = () => { nativeFullscreen = false; cancel(); };
  const passive = { passive: true };
  window.addEventListener('wheel', onWheel, passive);
  window.addEventListener('touchstart', onTouchStart, passive);
  window.addEventListener('touchend', onTouchEnd, passive);
  window.addEventListener('touchcancel', onTouchEnd, passive);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('scroll', queue, passive);
  window.addEventListener('scrollend', settle);
  window.addEventListener('resize', onResize);
  window.addEventListener('hashchange', cancel);
  document.addEventListener('fullscreenchange', cancel);
  document.addEventListener('webkitbeginfullscreen', onNativeBegin, true);
  document.addEventListener('webkitendfullscreen', onNativeEnd, true);
  return () => {
    cancel();
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('scroll', queue);
    window.removeEventListener('scrollend', settle);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('hashchange', cancel);
    document.removeEventListener('fullscreenchange', cancel);
    document.removeEventListener('webkitbeginfullscreen', onNativeBegin, true);
    document.removeEventListener('webkitendfullscreen', onNativeEnd, true);
  };
}
