import { parseNote } from '@/music/notes';

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
 * change the strumming from there on. A bar line starting with `notes` holds
 * single notes (`notes | C D E - | 5:3 |`). Full spec: docs/song-format.md.
 */
export function parseSong(text: string): Song {
  const song: Song = { title: 'Untitled', bpm: 80, beatsPerBar: 4, beatUnit: 4, bars: [] };
  let pattern: Stroke[] | undefined;

  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/(^|\s)#.*/, '').trim();
    if (!line) return;

    const notes = /^notes\s*\|/.test(line);
    if (notes || line.startsWith('|')) {
      pattern ??= defaultPattern(song.beatsPerBar);
      const cells = line.slice(line.indexOf('|')).split('|').slice(1);
      cells.forEach((cell, c) => {
        const tokens = cell.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) {
          if (c === cells.length - 1) return; // closing bar line
          throw new SongParseError('empty bar', n);
        }
        song.bars.push(notes ? parseNoteBar(tokens, song, n) : parseBar(tokens, song, pattern!, n));
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

function repeatBar(song: Song, n: number): Bar {
  const prev = song.bars.at(-1);
  if (!prev) throw new SongParseError('"%" needs a previous bar to repeat', n);
  return prev;
}

function parseBar(tokens: string[], song: Song, pattern: Stroke[], n: number): Bar {
  if (tokens.length === 1 && tokens[0] === '%') {
    const prev = repeatBar(song, n);
    // A repeated chord bar takes the current pattern; a note bar stays as is.
    return prev.notes ? prev : { chords: prev.chords.map((c) => ({ ...c })), pattern };
  }
  for (const t of tokens) {
    if (!CHORD.test(t)) throw new SongParseError(`"${t}" is not a chord name`, n);
  }
  const beats = song.beatsPerBar / tokens.length;
  return { chords: tokens.map((chord) => ({ chord, beats })), pattern };
}

function parseNoteBar(tokens: string[], song: Song, n: number): Bar {
  if (tokens.length === 1 && tokens[0] === '%') return repeatBar(song, n);
  const notes = tokens.map((t) => {
    if (t === '-') return null;
    const note = parseNote(t);
    if (!note) {
      throw new SongParseError(
        `"${t}" is not a note (use a name like C or F#3, or string:fret like 5:3)`,
        n,
      );
    }
    return note;
  });
  return { chords: [], pattern: [], notes };
}

/** One downstroke per beat. */
function defaultPattern(beatsPerBar: number): Stroke[] {
  return Array<Stroke>(beatsPerBar).fill('D');
}
