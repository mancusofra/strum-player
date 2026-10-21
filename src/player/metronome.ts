export type Click = 'accent' | 'normal';

/** Accent on the first beat of every bar, count-in included (beats below 0). */
export function clickFor(beat: number, beatsPerBar: number): Click {
  const inBar = ((beat % beatsPerBar) + beatsPerBar) % beatsPerBar;
  return inBar === 0 ? 'accent' : 'normal';
}
