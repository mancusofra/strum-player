<h1 align="center">Strum Player</h1>

<p align="center">
  A guitar practice player: load a song file with chords and strumming patterns and play along<br />
  in time, with chord names (C D E or Do Re Mi) and finger positions on the fretboard.
</p>

> **Status: early development (0.1.0).** This is the project skeleton; features are being added
> step by step.

## Planned features

- **Song files**: a plain-text format with chords, strumming pattern and tempo.
- **Strumming lane**: down/up arrows scrolling in time with the beat.
- **Chord names** as letters (`G`, `Am`) or solfège (`Sol`, `La minore`).
- **Chord diagrams** showing where to put your fingers.
- Metronome, adjustable tempo and count-in.
- Runs on iOS, Android and the web.

## Tech stack

[Expo](https://expo.dev) SDK 58 (React Native) with TypeScript · `react-native-web` ·
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
```

## Project structure

```
App.tsx           app entry screen
src/
└── music/        chord shapes and note naming (letters / solfège)
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
