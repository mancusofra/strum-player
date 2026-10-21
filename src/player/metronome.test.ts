import { clickFor } from './metronome';

describe('clickFor', () => {
  it('accents the first beat of each bar', () => {
    expect([0, 1, 2, 3, 4, 5].map((b) => clickFor(b, 4))).toEqual([
      'accent',
      'normal',
      'normal',
      'normal',
      'accent',
      'normal',
    ]);
  });

  it('accents the start of a count-in bar', () => {
    expect([-4, -3, -2, -1].map((b) => clickFor(b, 4))).toEqual([
      'accent',
      'normal',
      'normal',
      'normal',
    ]);
  });

  it('follows the time signature', () => {
    expect([0, 1, 2, 3].map((b) => clickFor(b, 3))).toEqual([
      'accent',
      'normal',
      'normal',
      'accent',
    ]);
  });
});
