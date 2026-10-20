<h1 align="center">Strum Player</h1>

<p align="center">
  A guitar practice player: load a song file with chords and strumming patterns and play along<br />
  in time, with chord names (C D E or Do Re Mi) and finger positions on the fretboard.
</p>

> **Status: early development (0.1.0).** You can already play along with a built-in example
> song; loading your own songs and sound come next.

## Features

- **Song files**: a plain-text format with chords, strumming pattern and tempo
  ([spec](docs/song-format.md)).
- **Chord carousel**: the current chord in the middle with its diagram, the next two on its
  right; it moves to the next chord one beat early, so you have time to change fingering.
- **Strumming lane**: `D` / `U` strokes scroll towards a hit line in time with the beat, with the
  count (`1 & 2 &`) underneath; the strum where the chord changes is highlighted.
- **Chord names** as letters (`G`, `Am`) or solfège (`Sol`, `La minore`).
- **Chord diagrams** showing where to put your fingers, barres included.
- Play / pause, restart, adjustable tempo and a one-bar count-in.
- Runs on iOS, Android and the web.

## Roadmap

| Step | What                                              | Status |
| ---- | ------------------------------------------------- | ------ |
| 1    | Song file format and parser                       | ✅     |
| 2    | Expo Router, home and player screens              | ✅     |
| 3    | Chord diagrams                                    | ✅     |
| 4    | Letter / solfège chord names                      | ✅     |
| 5    | Beat clock: play/pause, tempo, count-in           | ✅     |
| 6    | Strumming lane and chord carousel                 | ✅     |
| 7    | Metronome click                                   | next   |
| 8    | Load or paste your own songs, example library     |        |
| 9    | Single notes and riffs (tabs), polish, app builds |        |

## Tech stack

[Expo](https://expo.dev) SDK 58 (React Native) with TypeScript · Expo Router · `react-native-web` ·
`react-native-svg`.

## Running it locally

You need [Node.js 22](https://nodejs.org) and the **Expo Go** app on your phone (or an Android
emulator / iOS simulator, or just a browser).

```bash
git clone https://github.com/mancusofra/strum-player.git
cd strum-player
npm install
npx expo start        # scan the QR code with Expo Go, or press "w" for the web
```

The same checks run in CI:

```bash
npm run lint
npm run typecheck
npm test
```

## Project structure

```
docs/             song format spec
src/
├── app/          screens (Expo Router: one file per route)
├── components/   UI pieces (chord diagram and carousel, notation toggle, strumming lane)
├── music/        chord shapes, diagram layout, note naming (letters / solfège)
├── player/       beat clock (play/pause, tempo, count-in)
├── song/         song file types, parser, timeline, strum events, example song
└── theme.ts      shared colors
```

## Contributing

Bug reports and ideas are welcome: please read [CONTRIBUTING.md](CONTRIBUTING.md). Changes are
accepted only through pull requests, which are reviewed by the maintainer before being merged.
For security issues see [SECURITY.md](SECURITY.md).

## License

Copyright (C) 2026 Francesco Mancuso

Strum Player is free software: you can redistribute it and/or modify it under the terms of the
[GNU General Public License version 3](LICENSE) (GPL-3.0-only) as published by the Free Software
Foundation.

In short: you may use, study, modify and share the code; if you distribute a modified version you
must make its source code available under the same license. Strum Player comes with
**no warranty**; see [`LICENSE`](LICENSE) for the full terms.
