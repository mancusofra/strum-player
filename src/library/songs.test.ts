import { EXAMPLES, NEW_SONG_TEMPLATE } from '@/song/examples';

import { checkSong, findSong, librarySongs } from './songs';
import { createSongStore } from './store';

function store() {
  const data = new Map<string, string>();
  return createSongStore({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  });
}

describe('checkSong', () => {
  it('returns the parsed song', () => {
    expect(checkSong('title: A\n| C |').song?.title).toBe('A');
  });

  it('returns the error with its line', () => {
    expect(checkSong('| C |\n| H |').error).toBe('Line 2: "H" is not a chord name');
  });

  it('drops the line for whole-song errors', () => {
    expect(checkSong('title: Empty').error).toBe('the song has no bars');
  });

  it.each([...EXAMPLES.map((e) => [e.id, e.text]), ['template', NEW_SONG_TEMPLATE]])(
    '%s is a valid song',
    (_, text) => {
      expect(checkSong(text).error).toBeUndefined();
    },
  );
});

describe('library', () => {
  it('lists user songs before the examples', () => {
    const s = store();
    const id = s.save('title: Mine\n| C |');
    const songs = librarySongs(s);
    expect(songs[0]).toEqual({ id, text: 'title: Mine\n| C |', builtIn: false });
    expect(songs.slice(1).every((x) => x.builtIn)).toBe(true);
  });

  it('finds examples and user songs by id', () => {
    const s = store();
    const id = s.save('| C |');
    expect(findSong(s, EXAMPLES[0].id)?.builtIn).toBe(true);
    expect(findSong(s, id)?.text).toBe('| C |');
    expect(findSong(s, 'nope')).toBeUndefined();
    expect(findSong(s, undefined)).toBeUndefined();
  });
});
