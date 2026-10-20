import type { Song } from './types';

export interface TimedChord {
  chord: string;
  bar: number;
  /** Song beat the chord starts on, from 0. */
  start: number;
  beats: number;
}

export interface Timeline {
  chords: TimedChord[];
  beatsPerBar: number;
  totalBeats: number;
}

export interface Position {
  bar: number;
  /** Beat inside the bar, from 0. */
  beatInBar: number;
  chordIndex: number;
}

export function buildTimeline(song: Song): Timeline {
  const chords: TimedChord[] = [];
  let start = 0;
  song.bars.forEach((bar, b) => {
    for (const c of bar.chords) {
      chords.push({ chord: c.chord, bar: b, start, beats: c.beats });
      start += c.beats;
    }
  });
  return { chords, beatsPerBar: song.beatsPerBar, totalBeats: start };
}

/** Where `beat` falls in the song; beats outside it are clamped to the ends. */
export function positionAt(timeline: Timeline, beat: number): Position {
  const b = Math.min(Math.max(beat, 0), timeline.totalBeats - 1e-9);
  let chordIndex = timeline.chords.findIndex((c) => b < c.start + c.beats);
  if (chordIndex < 0) chordIndex = timeline.chords.length - 1;
  return {
    bar: Math.floor(b / timeline.beatsPerBar),
    beatInBar: Math.floor(b % timeline.beatsPerBar),
    chordIndex,
  };
}

/** The song's chords with repeats merged: `| G | % | D |` gives G, D. */
export function chordChanges(timeline: Timeline): TimedChord[] {
  const out: TimedChord[] = [];
  for (const c of timeline.chords) {
    const last = out.at(-1);
    if (last?.chord === c.chord) out[out.length - 1] = { ...last, beats: last.beats + c.beats };
    else out.push(c);
  }
  return out;
}

/** Index in `changes` of the chord sounding on `beat`. */
export function changeIndexAt(changes: TimedChord[], beat: number): number {
  let index = 0;
  changes.forEach((c, i) => {
    if (c.start <= beat) index = i;
  });
  return index;
}
