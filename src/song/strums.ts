import type { Song, Stroke } from './types';

export interface StrumEvent {
  /** Song beat the slot starts on, from 0. */
  beat: number;
  /** Slot length in beats. */
  length: number;
  stroke: Stroke;
  bar: number;
  /** Count to read under the slot: "1", "&", "e", "a" or "". */
  count: string;
}

const COUNTS: Record<number, string[]> = {
  1: [''],
  2: ['', '&'],
  4: ['', 'e', '&', 'a'],
};

/** Every slot of every bar's strumming pattern, laid out in song beats. */
export function strumEvents(song: Song): StrumEvent[] {
  const events: StrumEvent[] = [];
  song.bars.forEach((bar, b) => {
    const length = song.beatsPerBar / bar.pattern.length;
    const counts = COUNTS[bar.pattern.length / song.beatsPerBar];
    bar.pattern.forEach((stroke, i) => {
      const inBar = i * length;
      const sub = counts?.[i % counts.length];
      const count = sub === undefined ? '' : sub || String(Math.floor(inBar) + 1);
      events.push({ beat: b * song.beatsPerBar + inBar, length, stroke, bar: b, count });
    });
  });
  return events;
}
