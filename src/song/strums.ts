import type { Note } from '@/music/notes';

import type { Song, Stroke } from './types';

export interface StrumEvent {
  /** Song beat the slot starts on, from 0. */
  beat: number;
  /** Slot length in beats. */
  length: number;
  /** In a bar of single notes: '-' for a rest, otherwise see `note`. */
  stroke: Stroke;
  /** The single note to play on this slot. */
  note?: Note;
  bar: number;
  /** Count to read under the slot: "1", "&", "e", "a" or "". */
  count: string;
  /** Chord sounding on this slot; '' in a bar of single notes. */
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
    const slots = bar.notes ?? bar.pattern;
    const length = song.beatsPerBar / slots.length;
    const counts = COUNTS[slots.length / song.beatsPerBar];
    slots.forEach((slot, i) => {
      const inBar = i * length;
      const sub = counts?.[i % counts.length];
      const count = sub === undefined ? '' : sub || String(Math.floor(inBar) + 1);
      const chord = bar.notes ? '' : chordAt(bar.chords, inBar);
      const change = !!chord && chord !== events.at(-1)?.chord;
      const event: StrumEvent = {
        beat: b * song.beatsPerBar + inBar,
        length,
        stroke: '-',
        bar: b,
        count,
        chord,
        change,
      };
      if (typeof slot === 'string') event.stroke = slot;
      else if (slot) event.note = slot;
      events.push(event);
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
