import { CHORDS } from './chords';
import { layoutChord } from './diagram';

describe('layoutChord', () => {
  it('lays out an open chord from the nut', () => {
    const am = layoutChord(CHORDS.Am);
    expect(am.baseFret).toBe(1);
    expect(am.rows).toBe(4);
    expect(am.strings).toEqual(['muted', 'open', 'fretted', 'fretted', 'fretted', 'open']);
    expect(am.dots).toEqual([
      { string: 2, row: 2, finger: 2 },
      { string: 3, row: 2, finger: 3 },
      { string: 4, row: 1, finger: 1 },
    ]);
    expect(am.barres).toEqual([]);
  });

  it('draws a full barre and keeps the other fingers as dots', () => {
    const f = layoutChord(CHORDS.F);
    expect(f.barres).toEqual([{ row: 1, from: 0, to: 5, finger: 1 }]);
    expect(f.dots.map((d) => d.string)).toEqual([1, 2, 3]);
  });

  it('draws a partial barre', () => {
    expect(layoutChord(CHORDS.Bm).barres).toEqual([{ row: 2, from: 1, to: 5, finger: 1 }]);
    expect(layoutChord(CHORDS.Dm7).barres).toEqual([{ row: 1, from: 4, to: 5, finger: 1 }]);
  });

  it('moves up the neck when the shape is above the 4th fret', () => {
    const cm = layoutChord(CHORDS.Cm);
    expect(cm.baseFret).toBe(3);
    expect(cm.barres).toEqual([{ row: 1, from: 1, to: 5, finger: 1 }]);
    expect(cm.dots).toEqual([
      { string: 2, row: 3, finger: 3 },
      { string: 3, row: 3, finger: 4 },
      { string: 4, row: 2, finger: 2 },
    ]);
  });

  it('keeps shapes that reach the 4th fret at the nut', () => {
    expect(layoutChord(CHORDS.B).baseFret).toBe(1);
  });
});
