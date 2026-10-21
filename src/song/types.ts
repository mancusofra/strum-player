import type { Note } from '@/music/notes';

/** One slot of a strumming pattern: down, up, rest, muted (chuck). */
export type Stroke = 'D' | 'U' | '-' | 'x';

export interface ChordSlot {
  chord: string;
  /** Length in beats; chords in a bar share it evenly. */
  beats: number;
}

export interface Bar {
  /** Empty in a bar of single notes. */
  chords: ChordSlot[];
  /** Slots spread evenly across the bar (8 slots in 4/4 = eighth notes). */
  pattern: Stroke[];
  /** Single notes instead of chords, one per slot; null is a rest. */
  notes?: (Note | null)[];
}

export interface Song {
  title: string;
  artist?: string;
  bpm: number;
  beatsPerBar: number;
  beatUnit: number;
  bars: Bar[];
}
