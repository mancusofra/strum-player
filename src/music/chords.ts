// Chord shapes, strings listed from low E (6th) to high e (1st).
// frets: -1 = muted, 0 = open. fingers: 0 = none, 1-4 = index..pinky.
export interface ChordShape {
  frets: number[];
  fingers: number[];
}

const s = (frets: string, fingers: string): ChordShape => ({
  frets: frets.split(' ').map((f) => (f === 'x' ? -1 : Number(f))),
  fingers: fingers.split(' ').map((f) => (f === '-' ? 0 : Number(f))),
});

export const CHORDS: Record<string, ChordShape> = {
  // Major
  C: s('x 3 2 0 1 0', '- 3 2 0 1 0'),
  D: s('x x 0 2 3 2', '- - 0 1 3 2'),
  E: s('0 2 2 1 0 0', '0 2 3 1 0 0'),
  F: s('1 3 3 2 1 1', '1 3 4 2 1 1'),
  G: s('3 2 0 0 0 3', '2 1 0 0 0 3'),
  A: s('x 0 2 2 2 0', '- 0 1 2 3 0'),
  B: s('x 2 4 4 4 2', '- 1 2 3 4 1'),
  Bb: s('x 1 3 3 3 1', '- 1 2 3 4 1'),
  // Minor
  Am: s('x 0 2 2 1 0', '- 0 2 3 1 0'),
  Bm: s('x 2 4 4 3 2', '- 1 3 4 2 1'),
  Cm: s('x 3 5 5 4 3', '- 1 3 4 2 1'),
  'C#m': s('x 4 6 6 5 4', '- 1 3 4 2 1'),
  Dm: s('x x 0 2 3 1', '- - 0 2 3 1'),
  Em: s('0 2 2 0 0 0', '0 2 3 0 0 0'),
  Fm: s('1 3 3 1 1 1', '1 3 4 1 1 1'),
  'F#m': s('2 4 4 2 2 2', '1 3 4 1 1 1'),
  Gm: s('3 5 5 3 3 3', '1 3 4 1 1 1'),
  // Sevenths
  A7: s('x 0 2 0 2 0', '- 0 2 0 3 0'),
  B7: s('x 2 1 2 0 2', '- 2 1 3 0 4'),
  C7: s('x 3 2 3 1 0', '- 3 2 4 1 0'),
  D7: s('x x 0 2 1 2', '- - 0 2 1 3'),
  E7: s('0 2 0 1 0 0', '0 2 0 1 0 0'),
  G7: s('3 2 0 0 0 1', '3 2 0 0 0 1'),
  Am7: s('x 0 2 0 1 0', '- 0 2 0 1 0'),
  Dm7: s('x x 0 2 1 1', '- - 0 2 1 1'),
  Em7: s('0 2 2 0 3 0', '0 1 2 0 3 0'),
  Cmaj7: s('x 3 2 0 0 0', '- 3 2 0 0 0'),
  Fmaj7: s('x x 3 2 1 0', '- - 3 2 1 0'),
  // Sus / add
  Asus2: s('x 0 2 2 0 0', '- 0 1 2 0 0'),
  Asus4: s('x 0 2 2 3 0', '- 0 1 2 3 0'),
  Dsus2: s('x x 0 2 3 0', '- - 0 1 3 0'),
  Dsus4: s('x x 0 2 3 3', '- - 0 1 3 4'),
  Esus4: s('0 2 2 2 0 0', '0 2 3 4 0 0'),
  Cadd9: s('x 3 2 0 3 3', '- 2 1 0 3 4'),
};

const ENHARMONIC: Record<string, string> = {
  'A#': 'Bb',
  Db: 'C#',
  'D#': 'Eb',
  Gb: 'F#',
  'G#': 'Ab',
};

export function findChord(name: string): ChordShape | undefined {
  if (CHORDS[name]) return CHORDS[name];
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return undefined;
  const alt = ENHARMONIC[m[1]];
  if (alt && CHORDS[alt + m[2]]) return CHORDS[alt + m[2]];
  // Slash chord (G/B): fall back to the main chord shape.
  const slash = name.split('/')[0];
  return slash !== name ? findChord(slash) : undefined;
}
