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
  /** Chord sounding on this slot. */
  chord: string;
  /** First slot on a different chord than the slot before. */
  change: boolean;
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
      const chord = chordAt(bar.chords, inBar);
      const change = chord !== events.at(-1)?.chord;
      events.push({
        beat: b * song.beatsPerBar + inBar,
        length,
        stroke,
        bar: b,
        count,
        chord,
        change,
      });
    });
  });
  return events;
}

function chordAt(chords: Song['bars'][number]['chords'], beatInBar: number): string {
  let end = 0;
  for (const c of chords) {
    end += c.beats;
    if (beatInBar < end - 1e-9) return c.chord;
  }
  return chords[chords.length - 1].chord;
}
