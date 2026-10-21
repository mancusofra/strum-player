# Song format

A song is a plain-text file (UTF-8, any extension, e.g. `.txt`), which you can write in the app's
editor or import with "Import file". Header lines (`key: value`) come first, then bar lines.

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

## Single notes

A bar line starting with `notes` holds single notes instead of chords. Like a pattern, each token is
one slot, spread evenly across the bar.

```
notes | C D E F | G A B C4 |
notes | 5:3 - 4:0 4:2 | 3:0 - - - |
```

| Token           | Meaning                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `C`, `F#`, `Bb` | A note name, played as close to the nut as possible. Without an octave it is in octave 3, so `C D E F G A B` is the C major scale in first position. |
| `C4`, `E2`      | A note name with its octave (`C4` is middle C, `E2` the low E string).                                                                               |
| `5:3`           | String and fret, as in tab: strings 1 (high e) to 6 (low E), frets 0–15.                                                                             |
| `-`             | Rest.                                                                                                                                                |
| `%`             | Repeats the previous bar.                                                                                                                            |

The player shows each note's name (as letters or solfège), its string and fret, and the finger to use
in first position (fret 1 index … fret 4 pinky).

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
