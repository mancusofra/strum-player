// Single notes on a guitar in standard tuning. Strings are numbered as in
// tab: 1 is the high e, 6 the low E.

export interface Note {
  string: number;
  fret: number;
  /** MIDI pitch, 60 = middle C (C4). */
  midi: number;
  /** Pitch name without octave, as written (C, F#, Bb). */
  name: string;
}

const OPEN_MIDI: Record<number, number> = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const MAX_FRET = 15;
// Without an octave, names fall in octave 3, where C to B is the C major
// scale in first position (5:3 up to 2:0).
const DEFAULT_OCTAVE = 3;

const PITCH_CLASS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Reads a note token: a pitch name with optional octave (`C`, `F#`, `Bb3`,
 * `C4`) or a tab position `string:fret` (`5:3`). Returns undefined if the
 * token is neither or cannot be played.
 */
export function parseNote(token: string): Note | undefined {
  const tab = token.match(/^([1-6]):(\d{1,2})$/);
  if (tab) {
    const string = Number(tab[1]);
    const fret = Number(tab[2]);
    if (fret > MAX_FRET) return undefined;
    const midi = OPEN_MIDI[string] + fret;
    return { string, fret, midi, name: SHARP_NAMES[midi % 12] };
  }
  const pitch = token.match(/^([A-G])([#b]?)(\d)?$/);
  if (!pitch) return undefined;
  const [, letter, accidental, octave] = pitch;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  const midi = (Number(octave ?? DEFAULT_OCTAVE) + 1) * 12 + PITCH_CLASS[letter] + shift;
  const position = lowestPosition(midi);
  return position && { ...position, midi, name: letter + accidental };
}

/** The place closest to the nut where `midi` can be played. */
function lowestPosition(midi: number): { string: number; fret: number } | undefined {
  let best: { string: number; fret: number } | undefined;
  for (let string = 1; string <= 6; string++) {
    const fret = midi - OPEN_MIDI[string];
    if (fret >= 0 && fret <= MAX_FRET && (!best || fret < best.fret)) best = { string, fret };
  }
  return best;
}

/** Suggested finger in first position: fret 1 index … fret 4 pinky. */
export function fingerFor(note: Note): number {
  return note.fret >= 1 && note.fret <= 4 ? note.fret : 0;
}

/** "string 5 · fret 3", or "string 3 · open". */
export function positionLabel(note: Note): string {
  return `string ${note.string} · ${note.fret === 0 ? 'open' : `fret ${note.fret}`}`;
}
