import { createSongStore, type KeyValue } from './store';

function memory(): KeyValue & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

describe('createSongStore', () => {
  it('adds, updates and lists songs, newest first', () => {
    let t = 1;
    const store = createSongStore(memory(), () => t++);
    const a = store.save('title: A\n| C |');
    const b = store.save('title: B\n| G |');
    expect(store.list().map((s) => s.id)).toEqual([b, a]);

    expect(store.save('title: A2\n| C |', a)).toBe(a);
    expect(store.list().map((s) => s.id)).toEqual([a, b]);
    expect(store.get(a)?.text).toBe('title: A2\n| C |');
  });

  it('adds a new song when the id is unknown', () => {
    const store = createSongStore(memory());
    const id = store.save('| C |', 'gone');
    expect(id).not.toBe('gone');
    expect(store.list()).toHaveLength(1);
  });

  it('removes songs', () => {
    const store = createSongStore(memory());
    const id = store.save('| C |');
    store.remove(id);
    expect(store.list()).toEqual([]);
  });

  it('survives corrupted data', () => {
    const kv = memory();
    kv.data.set('strum-player/songs', '{not json');
    expect(createSongStore(kv).list()).toEqual([]);
  });
});
