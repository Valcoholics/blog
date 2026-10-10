import { useEffect, useState, type MutableRefObject, type RefObject } from 'react';

import { enableMobileSceneSnap } from './mobileSceneSnap';

export function useSceneSnap(
  railRef: RefObject<HTMLElement | null>,
  fullscreenScrollRef: MutableRefObject<number | null>,
  reducedMotion: boolean
) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px), (max-aspect-ratio: 6 / 5)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (mobile) {
      const rail = railRef.current;
      return rail ? enableMobileSceneSnap(rail, fullscreenScrollRef, reducedMotion) : undefined;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let held = false;
    let restingY = window.scrollY;
    let correcting = false;
    let intent: { start: number; anchor: HTMLElement | null; advance: boolean } | null = null;
    const scenes = () => Array.from(
      railRef.current?.querySelectorAll<HTMLElement>('[data-scene-snap]') ?? []
    ).map((element) => ({ element, top: window.scrollY + element.getBoundingClientRect().top }));
    const cancel = () => {
      clearTimeout(timer);
      intent = null;
      restingY = window.scrollY;
      correcting = false;
    };
    const begin = (advance: boolean) => {
      if (intent || fullscreenScrollRef.current !== null || document.fullscreenElement) return;
      // A passive wheel event can arrive after compositor scrolling has begun.
      // Keep the previous resting position as the gesture's actual origin.
      const start = correcting ? window.scrollY : restingY;
      correcting = false;
      intent = {
        start,
        anchor: scenes().find((scene) => Math.abs(scene.top - start) <= 4)?.element ?? null,
        advance,
      };
    };
    const settle = () => {
      clearTimeout(timer);
      if (held) return;
      const gesture = intent;
      // Consume the gesture before scrolling so our correction cannot trigger itself.
      intent = null;
      restingY = window.scrollY;
      correcting = false;
      if (!gesture) return;
      if (fullscreenScrollRef.current !== null || document.fullscreenElement) return;
      const stops = scenes();
      const y = window.scrollY;
      const height = (railRef.current?.firstElementChild as HTMLElement | null)?.clientHeight || window.innerHeight;
      if (!stops.length || y < stops[0].top || y > stops[stops.length - 1].top) return;
      if (stops.some(({ element, top }) => element.hasAttribute('data-reading') &&
        element.offsetHeight > height + 4 && y > top + 4 && y < top + element.offsetHeight - 4)) return;
      let target = stops.reduce((nearest, scene) =>
        Math.abs(scene.top - y) < Math.abs(nearest.top - y) ? scene : nearest
      );
      const origin = stops.findIndex((scene) => scene.element === gesture.anchor);
      const displacement = y - gesture.start;
      let advancing = false;
      if (gesture.advance && origin >= 0 && target.element === gesture.anchor &&
        Math.abs(displacement) >= Math.min(120, height * 0.12)) {
        target = stops[origin + Math.sign(displacement)] ?? target;
        advancing = target.element !== gesture.anchor;
      }
      if (Math.abs(target.top - y) <= 4 || (!advancing && Math.abs(target.top - y) > height * 0.65)) return;
      correcting = true;
      restingY = target.top;
      window.scrollTo({ top: target.top, behavior: reducedMotion ? 'instant' : 'smooth' });
    };
    const queue = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 180);
    };
    const onWheel = () => begin(true);
    const onTouchStart = () => { cancel(); held = true; begin(true); };
    const onTouchEnd = (event: TouchEvent) => {
      if (!event.touches.length) { held = false; queue(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      cancel();
      held = event.button === 0 && event.clientX >= document.documentElement.clientWidth;
      if (held) begin(false);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') { held = false; queue(); }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      cancel();
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      if (['PageDown', 'PageUp', ' '].includes(event.key)) begin(false);
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('a, button')) cancel();
    };
    const passive = { passive: true };
    window.addEventListener('wheel', onWheel, passive);
    window.addEventListener('touchstart', onTouchStart, passive);
    window.addEventListener('touchend', onTouchEnd, passive);
    window.addEventListener('touchcancel', onTouchEnd, passive);
    window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
    window.addEventListener('pointerup', onPointerUp, passive);
    window.addEventListener('pointercancel', onPointerUp, passive);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('click', onClick, true);
    window.addEventListener('scroll', queue, passive);
    window.addEventListener('scrollend', settle);
    window.addEventListener('hashchange', cancel);
    document.addEventListener('fullscreenchange', cancel);
    return () => {
      cancel();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('scrollend', settle);
      window.removeEventListener('hashchange', cancel);
      document.removeEventListener('fullscreenchange', cancel);
    };
  }, [railRef, fullscreenScrollRef, reducedMotion, mobile]);
}
