import { parseSong, SongParseError } from './parse';

describe('parseSong', () => {
  it('reads headers, pattern and bars', () => {
    const song = parseSong(`
      # warm-up
      title: Exercise
      artist: Me
      bpm: 90
      time: 3/4
      pattern: D-DU-U
      | G | D | Em |
    `);
    expect(song).toMatchObject({ title: 'Exercise', artist: 'Me', bpm: 90, beatsPerBar: 3 });
    expect(song.bars.map((b) => b.chords[0].chord)).toEqual(['G', 'D', 'Em']);
    expect(song.bars[0].pattern.join('')).toBe('D-DU-U');
  });

  it('uses defaults and one downstroke per beat', () => {
    const song = parseSong('| C |');
    expect(song).toMatchObject({ title: 'Untitled', bpm: 80, beatsPerBar: 4, beatUnit: 4 });
    expect(song.bars[0].pattern.join('')).toBe('DDDD');
  });

  it('treats an empty artist as no artist', () => {
    expect(parseSong('artist:\n| C |').artist).toBeUndefined();
  });

  it('splits a bar evenly between its chords', () => {
    const [bar] = parseSong('| G D |').bars;
    expect(bar.chords).toEqual([
      { chord: 'G', beats: 2 },
      { chord: 'D', beats: 2 },
    ]);
  });

  it('accepts bars without a closing bar line', () => {
    expect(parseSong('| G | D').bars).toHaveLength(2);
  });

  it('repeats the previous bar with %', () => {
    const song = parseSong('| G D | % |');
    expect(song.bars[1].chords).toEqual(song.bars[0].chords);
  });

  it('ignores comments after a bar line', () => {
    expect(parseSong('| G | D | # verse').bars).toHaveLength(2);
  });

  it('changes pattern between bar lines', () => {
    const song = parseSong('pattern: DDDD\n| G |\npattern: D-DU-UDU\n| C |');
    expect(song.bars.map((b) => b.pattern.join(''))).toEqual(['DDDD', 'D-DU-UDU']);
  });

  it('accepts sharps, flats, extensions and slash chords', () => {
    const chords = parseSong('| F#m Bb | Cmaj7 G/B |').bars.flatMap((b) =>
      b.chords.map((c) => c.chord),
    );
    expect(chords).toEqual(['F#m', 'Bb', 'Cmaj7', 'G/B']);
  });

  it('reads bars of single notes', () => {
    const song = parseSong('| G |\nnotes | C - 5:3 F#3 | % |');
    expect(song.bars[1].chords).toEqual([]);
    expect(song.bars[1].notes?.map((n) => n && `${n.name}@${n.string}:${n.fret}`)).toEqual([
      'C@5:3',
      null,
      'C@5:3',
      'F#@4:4',
    ]);
    expect(song.bars[2]).toEqual(song.bars[1]);
  });

  it('keeps the pattern when a chord bar follows notes', () => {
    const song = parseSong('pattern: DDDD\nnotes | C D |\n| G | % |');
    expect(song.bars[1].pattern.join('')).toBe('DDDD');
    expect(song.bars[2]).toEqual(song.bars[1]);
  });

  it.each([
    ['notes | C H |', 1, 'not a note'],
    ['notes | 7:2 |', 1, 'not a note'],
    ['| G | H |', 1, 'not a chord'],
    ['| % |', 1, 'previous bar'],
    ['| G || D |', 1, 'empty bar'],
    ['pattern: DXU', 1, 'pattern'],
    ['bpm: fast\n| G |', 1, 'bpm'],
    ['time: 4\n| G |', 1, 'time'],
    ['tempo: 80\n| G |', 1, 'unknown key'],
    ['| G |\nbpm: 90', 2, 'before the first bar'],
    ['G D Em', 1, 'bar line'],
  ])('rejects %j at line %i', (text, line, message) => {
    expect(() => parseSong(text)).toThrow(SongParseError);
    try {
      parseSong(text);
    } catch (e) {
      expect((e as SongParseError).line).toBe(line);
      expect((e as Error).message).toContain(message);
    }
  });

  it('rejects a song with no bars', () => {
    expect(() => parseSong('title: Empty')).toThrow('no bars');
  });
});
