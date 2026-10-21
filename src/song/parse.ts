import type { Bar, Song, Stroke } from './types';

export class SongParseError extends Error {
  constructor(
    message: string,
    public line: number,
  ) {
    super(`Line ${line}: ${message}`);
    this.name = 'SongParseError';
  }
}

const CHORD = /^[A-G][#b]?[^\s/|%]*(\/[A-G][#b]?)?$/;
const STROKES = /^[DUx-]+$/;

/**
 * Parses a song sheet:
 *
 *   title: Exercise
 *   bpm: 80
 *   time: 4/4
 *   pattern: D-DU-UDU
 *   | G | D | Em C | % |
 *
 * `#` at the start of a line or after a space starts a comment, `%` repeats
 * the previous bar, and `pattern:` may be set again between bar lines to
 * change the strumming from there on. Full spec: docs/song-format.md.
 */
export function parseSong(text: string): Song {
  const song: Song = { title: 'Untitled', bpm: 80, beatsPerBar: 4, beatUnit: 4, bars: [] };
  let pattern: Stroke[] | undefined;

  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/(^|\s)#.*/, '').trim();
    if (!line) return;

    if (line.startsWith('|')) {
      pattern ??= defaultPattern(song.beatsPerBar);
      const cells = line.split('|').slice(1);
      cells.forEach((cell, c) => {
        const tokens = cell.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) {
          if (c === cells.length - 1) return; // closing bar line
          throw new SongParseError('empty bar', n);
        }
        song.bars.push(parseBar(tokens, song, pattern!, n));
      });
      return;
    }

    const m = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (!m) throw new SongParseError(`expected "key: value" or a bar line, got "${line}"`, n);
    const [, key, value] = m;

    if (key === 'pattern') {
      if (!STROKES.test(value)) {
        throw new SongParseError(`pattern may only use D, U, x and -, got "${value}"`, n);
      }
      pattern = value.split('') as Stroke[];
      return;
    }
    if (song.bars.length > 0) {
      throw new SongParseError(`"${key}" must come before the first bar`, n);
    }
    switch (key) {
      case 'title':
        song.title = value;
        break;
      case 'artist':
        song.artist = value || undefined;
        break;
      case 'bpm': {
        const bpm = Number(value);
        if (!Number.isInteger(bpm) || bpm < 20 || bpm > 300) {
          throw new SongParseError(`bpm must be a whole number from 20 to 300, got "${value}"`, n);
        }
        song.bpm = bpm;
        break;
      }
      case 'time': {
        const t = value.match(/^(\d+)\/(\d+)$/);
        const beats = Number(t?.[1]);
        const unit = Number(t?.[2]);
        if (!t || beats < 1 || beats > 16 || ![2, 4, 8, 16].includes(unit)) {
          throw new SongParseError(`time must look like 4/4 or 6/8, got "${value}"`, n);
        }
        song.beatsPerBar = beats;
        song.beatUnit = unit;
        break;
      }
      default:
        throw new SongParseError(`unknown key "${key}"`, n);
    }
  });

  if (song.bars.length === 0) throw new SongParseError('the song has no bars', 0);
  return song;
}

function parseBar(tokens: string[], song: Song, pattern: Stroke[], n: number): Bar {
  if (tokens.length === 1 && tokens[0] === '%') {
    const prev = song.bars.at(-1);
    if (!prev) throw new SongParseError('"%" needs a previous bar to repeat', n);
    return { chords: prev.chords.map((c) => ({ ...c })), pattern };
  }
  for (const t of tokens) {
    if (!CHORD.test(t)) throw new SongParseError(`"${t}" is not a chord name`, n);
  }
  const beats = song.beatsPerBar / tokens.length;
  return { chords: tokens.map((chord) => ({ chord, beats })), pattern };
}

/** One downstroke per beat. */
function defaultPattern(beatsPerBar: number): Stroke[] {
  return Array<Stroke>(beatsPerBar).fill('D');
}
