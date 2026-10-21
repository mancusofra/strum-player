import { checkImport, MAX_IMPORT_BYTES } from './imported';

describe('checkImport', () => {
  it('returns the text without a byte order mark', async () => {
    expect(await checkImport('a.txt', 12, async () => '﻿| C |')).toEqual({
      name: 'a.txt',
      text: '| C |',
    });
  });

  it('refuses files that are too big without reading them', async () => {
    const read = jest.fn();
    const result = await checkImport('big.txt', MAX_IMPORT_BYTES + 1, read);
    expect(result).toEqual({ name: 'big.txt', error: 'big.txt is too big for a song file.' });
    expect(read).not.toHaveBeenCalled();
  });

  it('refuses binary files', async () => {
    expect(await checkImport('a.png', 10, async () => 'PNG\0\0')).toEqual({
      name: 'a.png',
      error: 'a.png is not a text file.',
    });
  });
});
