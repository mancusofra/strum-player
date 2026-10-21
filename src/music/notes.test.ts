import { fingerFor, parseNote, positionLabel } from './notes';

describe('parseNote', () => {
  it('places the C major scale in first position', () => {
    const scale = 'C D E F G A B C4'.split(' ').map((t) => {
      const n = parseNote(t)!;
      return `${n.string}:${n.fret}`;
    });
    expect(scale).toEqual(['5:3', '4:0', '4:2', '4:3', '3:0', '3:2', '2:0', '2:1']);
  });

  it('reads sharps, flats and octaves', () => {
    expect(parseNote('F#')).toEqual({ string: 4, fret: 4, midi: 54, name: 'F#' });
    expect(parseNote('Bb3')).toMatchObject({ string: 3, fret: 3, midi: 58, name: 'Bb' });
    expect(parseNote('E2')).toMatchObject({ string: 6, fret: 0 });
    expect(parseNote('E4')).toMatchObject({ string: 1, fret: 0 });
  });

  it('reads tab positions and names them', () => {
    expect(parseNote('5:3')).toEqual({ string: 5, fret: 3, midi: 48, name: 'C' });
    expect(parseNote('1:0')).toMatchObject({ midi: 64, name: 'E' });
    expect(parseNote('6:1')).toMatchObject({ name: 'F' });
    expect(parseNote('4:4')).toMatchObject({ name: 'F#' });
  });

  it.each(['H', 'C9', '7:1', '0:2', '3:16', 'Cm', '-', 'D-'])('rejects %s', (t) => {
    expect(parseNote(t)).toBeUndefined();
  });
});

describe('labels', () => {
  it('suggests first-position fingers', () => {
    expect(
      [0, 1, 2, 3, 4, 5].map((fret) => fingerFor({ string: 1, fret, midi: 0, name: '' })),
    ).toEqual([0, 1, 2, 3, 4, 0]);
  });

  it('describes the position', () => {
    expect(positionLabel(parseNote('C')!)).toBe('string 5 · fret 3');
    expect(positionLabel(parseNote('G')!)).toBe('string 3 · open');
  });
});
