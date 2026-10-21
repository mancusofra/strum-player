// Built-in practice songs, always shown in the library.
export interface Example {
  id: string;
  text: string;
}

export const EXAMPLES: Example[] = [
  {
    id: 'example-four-chords',
    text: `title: Four Chord Warm-up
artist: Practice
bpm: 80
time: 4/4
pattern: D-DU-UDU

| G | D | Em | C |
| G | D | C D | G |
`,
  },
  {
    id: 'example-first-strums',
    text: `title: First Strums
artist: Practice
bpm: 70
time: 4/4
# One downstroke per beat, then add the "&" upstrokes.
pattern: DDDD

| C | Am | F | G |
pattern: DUDUDUDU
| C | Am | F | G7 |
`,
  },
  {
    id: 'example-waltz',
    text: `title: Three-Four Waltz
artist: Practice
bpm: 90
time: 3/4
pattern: D-DUDU

| C | G7 | G7 | C |
| F | C | G7 | C |
`,
  },
  {
    id: 'example-muted-groove',
    text: `title: Muted Groove
artist: Practice
bpm: 85
time: 4/4
# x is a muted strum: rest your palm on the strings and hit them.
pattern: D-xU-UxU

| Am | Am | Dm | Dm |
| E7 | E7 | Am | Am |
`,
  },
];

/** Starting text for a new song in the editor. */
export const NEW_SONG_TEMPLATE = `title: My Song
bpm: 80
time: 4/4
# D down, U up, x muted, - rest; one character per slot.
pattern: D-DU-UDU

| G | D | Em | C |
`;
