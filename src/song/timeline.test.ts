import { EXAMPLE_SONG } from './examples';
import { parseSong } from './parse';
import { buildTimeline, positionAt, upcomingChords } from './timeline';

const timeline = buildTimeline(parseSong('| G | D Em | C |'));

describe('buildTimeline', () => {
  it('places every chord on the beat it starts', () => {
    expect(timeline.chords).toEqual([
      { chord: 'G', bar: 0, start: 0, beats: 4 },
      { chord: 'D', bar: 1, start: 4, beats: 2 },
      { chord: 'Em', bar: 1, start: 6, beats: 2 },
      { chord: 'C', bar: 2, start: 8, beats: 4 },
    ]);
    expect(timeline.totalBeats).toBe(12);
  });
});

describe('positionAt', () => {
  it.each([
    [0, { bar: 0, beatInBar: 0, chordIndex: 0 }],
    [3.9, { bar: 0, beatInBar: 3, chordIndex: 0 }],
    [5.5, { bar: 1, beatInBar: 1, chordIndex: 1 }],
    [6, { bar: 1, beatInBar: 2, chordIndex: 2 }],
    [11.99, { bar: 2, beatInBar: 3, chordIndex: 3 }],
  ])('beat %d', (beat, position) => {
    expect(positionAt(timeline, beat)).toEqual(position);
  });

  it('clamps beats before and after the song', () => {
    expect(positionAt(timeline, -3).chordIndex).toBe(0);
    expect(positionAt(timeline, 40)).toEqual({ bar: 2, beatInBar: 3, chordIndex: 3 });
  });
});

describe('EXAMPLE_SONG', () => {
  it('parses into a playable timeline', () => {
    const t = buildTimeline(parseSong(EXAMPLE_SONG));
    expect(t.totalBeats).toBe(32);
  });
});

describe('upcomingChords', () => {
  const t = buildTimeline(parseSong('| G | % | D Em | C | G |'));

  it('lists the next chord changes, skipping repeats', () => {
    expect(upcomingChords(t, 0, 2)).toEqual(['D', 'Em']);
    expect(upcomingChords(t, 2, 2)).toEqual(['Em', 'C']);
  });

  it('runs out at the end of the song', () => {
    expect(upcomingChords(t, 4, 2)).toEqual(['G']);
    expect(upcomingChords(t, 5, 2)).toEqual([]);
  });
});
