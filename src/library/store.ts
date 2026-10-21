export interface StoredSong {
  id: string;
  text: string;
  updatedAt: number;
}

/** The part of the Web Storage API the store needs. */
export type KeyValue = Pick<Storage, 'getItem' | 'setItem'>;

const KEY = 'strum-player/songs';

/** The user's songs, kept as one JSON list under a single key. */
export function createSongStore(kv: KeyValue, now: () => number = Date.now) {
  const read = (): StoredSong[] => {
    try {
      const songs = JSON.parse(kv.getItem(KEY) ?? '[]');
      return Array.isArray(songs) ? songs : [];
    } catch {
      return [];
    }
  };
  const write = (songs: StoredSong[]) => kv.setItem(KEY, JSON.stringify(songs));

  return {
    /** Most recently edited first. */
    list: () => read().sort((a, b) => b.updatedAt - a.updatedAt),
    get: (id: string) => read().find((s) => s.id === id),
    /** Updates the song with `id`, or adds a new one; returns its id. */
    save(text: string, id?: string): string {
      const songs = read();
      const existing = id ? songs.find((s) => s.id === id) : undefined;
      if (existing) {
        existing.text = text;
        existing.updatedAt = now();
      } else {
        id = `user-${now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        songs.push({ id, text, updatedAt: now() });
      }
      write(songs);
      return existing ? existing.id : id!;
    },
    remove(id: string) {
      write(read().filter((s) => s.id !== id));
    },
  };
}

export type SongStore = ReturnType<typeof createSongStore>;
