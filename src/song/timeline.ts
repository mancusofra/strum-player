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

/** The next `count` chord changes after `index`; repeats of a chord are skipped. */
export function upcomingChords(timeline: Timeline, index: number, count: number): string[] {
  const out: string[] = [];
  let last = timeline.chords[index]?.chord;
  for (let i = index + 1; i < timeline.chords.length && out.length < count; i++) {
    const { chord } = timeline.chords[i];
    if (chord !== last) out.push(chord);
    last = chord;
  }
  return out;
}
