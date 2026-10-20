/**
 * Beat clock driven by wall time, so it never drifts with frame rate.
 * Beats start at `-countIn` when playing from the top, so the song itself
 * begins at beat 0 after the count-in.
 */
export class Clock {
  private startedAt: number | null = null;
  private offset: number;

  constructor(
    public bpm: number,
    private countIn = 0,
    private now: () => number = () => performance.now(),
  ) {
    this.offset = -countIn;
  }

  get playing() {
    return this.startedAt !== null;
  }

  beat(): number {
    if (this.startedAt === null) return this.offset;
    return this.offset + ((this.now() - this.startedAt) / 60000) * this.bpm;
  }

  play() {
    if (this.startedAt === null) this.startedAt = this.now();
  }

  pause() {
    this.offset = this.beat();
    this.startedAt = null;
  }

  /** Changes tempo without jumping: the current beat is kept. */
  setBpm(bpm: number) {
    const playing = this.playing;
    this.offset = this.beat();
    this.bpm = bpm;
    if (playing) this.startedAt = this.now();
  }

  /** Back to the top, before the count-in, and stopped. */
  reset() {
    this.startedAt = null;
    this.offset = -this.countIn;
  }
}
