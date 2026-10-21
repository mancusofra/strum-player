import { EXAMPLES } from '@/song/examples';
import { parseSong, SongParseError } from '@/song/parse';
import type { Song } from '@/song/types';

import type { SongStore } from './store';

export interface LibrarySong {
  id: string;
  text: string;
  builtIn: boolean;
}

export type Checked = { song: Song; error?: undefined } | { song?: undefined; error: string };

/** Parses a song text, turning a parse error into a message. */
export function checkSong(text: string): Checked {
  try {
    return { song: parseSong(text) };
  } catch (e) {
    if (e instanceof SongParseError) {
      return { error: e.line > 0 ? e.message : e.message.replace(/^Line 0: /, '') };
    }
    throw e;
  }
}

/** The user's songs, newest first, followed by the built-in examples. */
export function librarySongs(store: SongStore): LibrarySong[] {
  return [
    ...store.list().map((s) => ({ id: s.id, text: s.text, builtIn: false })),
    ...EXAMPLES.map((e) => ({ id: e.id, text: e.text, builtIn: true })),
  ];
}

export function findSong(store: SongStore, id: string | undefined): LibrarySong | undefined {
  if (!id) return undefined;
  const example = EXAMPLES.find((e) => e.id === id);
  if (example) return { id, text: example.text, builtIn: true };
  const stored = store.get(id);
  return stored && { id, text: stored.text, builtIn: false };
}
