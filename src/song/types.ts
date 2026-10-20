/** One slot of a strumming pattern: down, up, rest, muted (chuck). */
export type Stroke = 'D' | 'U' | '-' | 'x';

export interface ChordSlot {
  chord: string;
  /** Length in beats; chords in a bar share it evenly. */
  beats: number;
}

export interface Bar {
  chords: ChordSlot[];
  /** Slots spread evenly across the bar (8 slots in 4/4 = eighth notes). */
  pattern: Stroke[];
}

export interface Song {
  title: string;
  artist?: string;
  bpm: number;
  beatsPerBar: number;
  beatUnit: number;
  bars: Bar[];
}
