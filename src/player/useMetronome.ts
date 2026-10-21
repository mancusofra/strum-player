import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { clickFor } from './metronome';

// A beat still clicks if the timer wakes this early or this late (in beats);
// late allows for the first click, which waits for React to start the timer.
const EARLY = 0.02;
const LATE = 0.1;

/**
 * Clicks once per beat while playing, higher on the first beat of each bar.
 * Each click is timed to the exact moment of its beat rather than to the next
 * frame. A beat clicks only once, so pausing and resuming inside a beat waits
 * for the next one instead of clicking off the beat.
 */
export function useMetronome(
  getBeat: () => number,
  bpm: number,
  playing: boolean,
  enabled: boolean,
  beatsPerBar: number,
) {
  const accent = useAudioPlayer(require('../../assets/sounds/click-accent.wav'));
  const normal = useAudioPlayer(require('../../assets/sounds/click.wav'));
  const lastClick = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || !enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const beat = getBeat();
      const current = Math.floor(beat + EARLY);
      if (beat - current <= LATE && lastClick.current !== current) {
        lastClick.current = current;
        const player = clickFor(current, beatsPerBar) === 'accent' ? accent : normal;
        void player.seekTo(0);
        player.play();
      }
      const next = current + 1;
      timer = setTimeout(tick, ((next - getBeat()) * 60000) / bpm);
    };
    tick();
    return () => clearTimeout(timer);
  }, [accent, normal, getBeat, bpm, playing, enabled, beatsPerBar]);
}
