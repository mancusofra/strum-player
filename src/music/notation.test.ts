import { chordLongName, chordSymbol } from './notation';

describe('chordSymbol', () => {
  it.each([
    ['C', 'C', 'Do'],
    ['Am', 'Am', 'Lam'],
    ['F#m', 'F#m', 'Fa#m'],
    ['Bb', 'Bb', 'Sib'],
    ['Dm7', 'Dm7', 'Rem7'],
    ['G/B', 'G/B', 'Sol/Si'],
  ])('%s -> %s / %s', (chord, letters, solfege) => {
    expect(chordSymbol(chord, 'letters')).toBe(letters);
    expect(chordSymbol(chord, 'solfege')).toBe(solfege);
  });

  it('leaves unknown names untouched', () => {
    expect(chordSymbol('Xyz', 'solfege')).toBe('Xyz');
  });
});

describe('chordLongName', () => {
  it.each([
    ['C', 'C major', 'Do maggiore'],
    ['Am', 'A minor', 'La minore'],
    ['E7', 'E dominant 7th', 'Mi settima'],
    ['Cmaj7', 'C major 7th', 'Do settima maggiore'],
    ['C#m', 'C# minor', 'Do# minore'],
    ['G/B', 'G major over B', 'Sol maggiore con basso Si'],
    ['A13', 'A 13', 'La 13'],
  ])('%s -> %s / %s', (chord, letters, solfege) => {
    expect(chordLongName(chord, 'letters')).toBe(letters);
    expect(chordLongName(chord, 'solfege')).toBe(solfege);
  });

  it('returns an empty string for unknown names', () => {
    expect(chordLongName('Xyz', 'letters')).toBe('');
  });
});
