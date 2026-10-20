export type Notation = 'letters' | 'solfege';

const SOLFEGE: Record<string, string> = {
  C: 'Do',
  D: 'Re',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Si',
};

const QUALITY: Record<string, { letters: string; solfege: string }> = {
  '': { letters: 'major', solfege: 'maggiore' },
  m: { letters: 'minor', solfege: 'minore' },
  '7': { letters: 'dominant 7th', solfege: 'settima' },
  maj7: { letters: 'major 7th', solfege: 'settima maggiore' },
  m7: { letters: 'minor 7th', solfege: 'minore settima' },
  sus2: { letters: 'suspended 2nd', solfege: 'sus2' },
  sus4: { letters: 'suspended 4th', solfege: 'sus4' },
  add9: { letters: 'add 9', solfege: 'add 9' },
  dim: { letters: 'diminished', solfege: 'diminuito' },
  aug: { letters: 'augmented', solfege: 'aumentato' },
};

function split(chord: string) {
  const m = chord.match(/^([A-G])([#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
  if (!m) return null;
  return { letter: m[1], acc: m[2], suffix: m[3], bass: m[4] };
}

function noteName(note: string, notation: Notation) {
  if (notation === 'letters') return note;
  return SOLFEGE[note[0]] + note.slice(1);
}

/** Short symbol: "Am" -> "Am" or "Lam". */
export function chordSymbol(chord: string, notation: Notation): string {
  const p = split(chord);
  if (!p) return chord;
  const bass = p.bass ? '/' + noteName(p.bass, notation) : '';
  return noteName(p.letter + p.acc, notation) + p.suffix + bass;
}

const OVER = { letters: 'over', solfege: 'con basso' };

/** Long name: "Am" -> "A minor" or "La minore"; "G/B" -> "G major over B". */
export function chordLongName(chord: string, notation: Notation): string {
  const p = split(chord);
  if (!p) return '';
  const q = QUALITY[p.suffix];
  const root = noteName(p.letter + p.acc, notation);
  const name = q ? `${root} ${q[notation]}` : `${root} ${p.suffix}`;
  return p.bass ? `${name} ${OVER[notation]} ${noteName(p.bass, notation)}` : name;
}
