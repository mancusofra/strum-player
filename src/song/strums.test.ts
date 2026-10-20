import { parseSong } from './parse';
import { strumEvents } from './strums';

describe('strumEvents', () => {
  it('spreads an eighth-note pattern across each bar', () => {
    const events = strumEvents(parseSong('pattern: D-DU-UDU\n| G | D |'));
    expect(events).toHaveLength(16);
    expect(events.slice(0, 4)).toEqual([
      { beat: 0, length: 0.5, stroke: 'D', bar: 0, count: '1' },
      { beat: 0.5, length: 0.5, stroke: '-', bar: 0, count: '&' },
      { beat: 1, length: 0.5, stroke: 'D', bar: 0, count: '2' },
      { beat: 1.5, length: 0.5, stroke: 'U', bar: 0, count: '&' },
    ]);
    expect(events[8]).toMatchObject({ beat: 4, bar: 1, count: '1' });
  });

  it('counts quarter and sixteenth notes', () => {
    const quarters = strumEvents(parseSong('pattern: DDDD\n| G |'));
    expect(quarters.map((e) => e.count)).toEqual(['1', '2', '3', '4']);
    const sixteenths = strumEvents(parseSong('pattern: DUDUDUDUDUDUDUDU\n| G |'));
    expect(sixteenths.slice(0, 5).map((e) => e.count)).toEqual(['1', 'e', '&', 'a', '2']);
  });

  it('leaves odd subdivisions uncounted', () => {
    const events = strumEvents(parseSong('pattern: DUD\n| G |'));
    expect(events.map((e) => e.count)).toEqual(['', '', '']);
    expect(events[1].beat).toBeCloseTo(4 / 3);
  });

  it('follows pattern changes', () => {
    const events = strumEvents(parseSong('pattern: DDDD\n| G |\npattern: D-DU-UDU\n| C |'));
    expect(events).toHaveLength(12);
    expect(events[4]).toMatchObject({ beat: 4, length: 0.5 });
  });
});
