import { useCallback, useEffect, useRef, useState } from 'react';

import { Clock } from './clock';

/**
 * Runs a Clock on animation frames. `beat` is the whole beat (negative during
 * the count-in) and only changes once per beat, so the screen re-renders on
 * the beat rather than every frame. At the end of the song it stops and goes
 * back to the top.
 */
export function useClock(bpm: number, countIn: number, totalBeats: number) {
  const clockRef = useRef<Clock | null>(null);
  clockRef.current ??= new Clock(bpm, countIn);
  const clock = clockRef.current;

  const [beat, setBeat] = useState(() => Math.floor(clock.beat()));
  const [playing, setPlaying] = useState(false);

  useEffect(() => clock.setBpm(bpm), [clock, bpm]);

  useEffect(() => {
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      const b = clock.beat();
      if (b >= totalBeats) {
        clock.reset();
        setPlaying(false);
        setBeat(Math.floor(clock.beat()));
        return;
      }
      setBeat(Math.floor(b));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [clock, playing, totalBeats]);

  const toggle = useCallback(() => {
    if (clock.playing) clock.pause();
    else clock.play();
    setPlaying(clock.playing);
  }, [clock]);

  const restart = useCallback(() => {
    clock.reset();
    setPlaying(false);
    setBeat(Math.floor(clock.beat()));
  }, [clock]);

  return { beat, playing, toggle, restart };
}
