import type { ChordShape } from './chords';

export type StringState = 'muted' | 'open' | 'fretted';

export interface Dot {
  /** 0 = low E (left), 5 = high e (right). */
  string: number;
  /** Row on the diagram, 1 = first fret shown. */
  row: number;
  finger: number;
}

export interface Barre {
  row: number;
  from: number;
  to: number;
  finger: number;
}

export interface DiagramLayout {
  /** Fret number of row 1; 1 means the nut is drawn. */
  baseFret: number;
  /** How many fret rows to draw. */
  rows: number;
  strings: StringState[];
  dots: Dot[];
  barres: Barre[];
}

const MIN_ROWS = 4;

/** Turns a chord shape into what a vertical chord box needs to draw. */
export function layoutChord(shape: ChordShape): DiagramLayout {
  const fretted = shape.frets.filter((f) => f > 0);
  const max = Math.max(0, ...fretted);
  const baseFret = max <= MIN_ROWS ? 1 : Math.min(...fretted);
  const rows = Math.max(MIN_ROWS, max - baseFret + 1);

  const strings = shape.frets.map<StringState>((f) =>
    f < 0 ? 'muted' : f === 0 ? 'open' : 'fretted',
  );

  // A finger pressing several strings on the same fret is a barre.
  const barres: Barre[] = [];
  const byFinger = new Map<string, number[]>();
  shape.frets.forEach((fret, string) => {
    const finger = shape.fingers[string];
    if (fret <= 0 || finger === 0) return;
    const key = `${finger}@${fret}`;
    byFinger.set(key, [...(byFinger.get(key) ?? []), string]);
  });
  for (const [key, list] of byFinger) {
    if (list.length < 2) continue;
    const [finger, fret] = key.split('@').map(Number);
    barres.push({ row: fret - baseFret + 1, from: list[0], to: list.at(-1)!, finger });
  }

  const inBarre = (string: number, row: number) =>
    barres.some((b) => b.row === row && string >= b.from && string <= b.to);
  const dots: Dot[] = [];
  shape.frets.forEach((fret, string) => {
    if (fret <= 0) return;
    const row = fret - baseFret + 1;
    if (!inBarre(string, row)) dots.push({ string, row, finger: shape.fingers[string] });
  });

  return { baseFret, rows, strings, dots, barres };
}
