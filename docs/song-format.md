# Song format

A song is a plain-text file. Header lines (`key: value`) come first, then bar lines.

```
# Comments start with "#" at the start of a line or after a space.
title: Exercise
artist: Someone
bpm: 80
time: 4/4
pattern: D-DU-UDU

| G | D | Em | C |   # verse
| G D | % | Am |
pattern: DDDD
| C | G |
```

## Headers

| Key       | Default          | Notes                                                |
| --------- | ---------------- | ---------------------------------------------------- |
| `title`   | `Untitled`       |                                                      |
| `artist`  | —                | Optional.                                            |
| `bpm`     | `80`             | Whole number from 20 to 300.                         |
| `time`    | `4/4`            | Beats per bar / beat unit, e.g. `3/4`, `6/8`.        |
| `pattern` | one `D` per beat | See below. The only key allowed after the first bar. |

## Bars

- A bar line starts with `|`; each `|` separates one bar. The closing `|` is optional.
- One chord fills the whole bar. Several chords share the bar evenly: `| G D |` in 4/4 is two
  beats each.
- `%` repeats the previous bar's chords.
- Chord names are letters: a root `A`–`G`, an optional `#` or `b`, any suffix (`m`, `7`, `maj7`,
  `sus4`…) and an optional bass note (`G/B`).

## Strumming pattern

Each character is one slot, and the slots are spread evenly across the bar: 8 slots in 4/4 are
eighth notes, 4 slots are quarter notes.

| Char | Meaning                                           |
| ---- | ------------------------------------------------- |
| `D`  | downstroke ↓                                      |
| `U`  | upstroke ↑                                        |
| `x`  | muted strum (chuck)                               |
| `-`  | rest: keep the hand moving, don't hit the strings |

A `pattern:` line between bar lines changes the pattern for the bars that follow.
