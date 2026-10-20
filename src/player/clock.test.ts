import { Clock } from './clock';

function setup(bpm = 60, countIn = 0) {
  let t = 0;
  const clock = new Clock(bpm, countIn, () => t);
  return { clock, advance: (ms: number) => (t += ms) };
}

describe('Clock', () => {
  it('counts beats from wall time', () => {
    const { clock, advance } = setup(120);
    clock.play();
    advance(1500);
    expect(clock.beat()).toBe(3);
  });

  it('starts before 0 by the count-in', () => {
    const { clock, advance } = setup(60, 4);
    expect(clock.beat()).toBe(-4);
    clock.play();
    advance(4000);
    expect(clock.beat()).toBe(0);
  });

  it('holds the beat while paused', () => {
    const { clock, advance } = setup();
    clock.play();
    advance(2000);
    clock.pause();
    advance(5000);
    expect(clock.beat()).toBe(2);
    expect(clock.playing).toBe(false);
    clock.play();
    advance(1000);
    expect(clock.beat()).toBe(3);
  });

  it('changes tempo without jumping', () => {
    const { clock, advance } = setup(60);
    clock.play();
    advance(2000);
    clock.setBpm(120);
    expect(clock.beat()).toBe(2);
    advance(1000);
    expect(clock.beat()).toBe(4);
  });

  it('resets to the count-in, stopped', () => {
    const { clock, advance } = setup(60, 4);
    clock.play();
    advance(9000);
    clock.reset();
    expect(clock.beat()).toBe(-4);
    expect(clock.playing).toBe(false);
  });
});
