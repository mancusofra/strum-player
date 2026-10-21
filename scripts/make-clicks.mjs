// Generates the metronome clicks in assets/sounds: short decaying sine
// blips, higher for the first beat of a bar. Run: node scripts/make-clicks.mjs
import { writeFileSync } from 'node:fs';

const RATE = 44100;
const LENGTH = 0.05; // seconds

function click(freq, gain) {
  const n = Math.round(RATE * LENGTH);
  const data = Buffer.alloc(44 + n * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + n * 2, 4);
  data.write('WAVE', 8);
  data.write('fmt ', 12);
  data.writeUInt32LE(16, 16); // PCM chunk size
  data.writeUInt16LE(1, 20); // PCM
  data.writeUInt16LE(1, 22); // mono
  data.writeUInt32LE(RATE, 24);
  data.writeUInt32LE(RATE * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const attack = Math.min(1, t / 0.001);
    const env = attack * Math.exp(-t / 0.012);
    const sample = Math.sin(2 * Math.PI * freq * t) * env * gain;
    data.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return data;
}

const dir = new URL('../assets/sounds/', import.meta.url);
writeFileSync(new URL('click-accent.wav', dir), click(1600, 0.9));
writeFileSync(new URL('click.wav', dir), click(1000, 0.7));
