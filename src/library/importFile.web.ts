import { getDocumentAsync } from 'expo-document-picker';

import { checkImport, type Imported } from './imported';

/** Lets the user pick a text file and reads it; null if they cancel. */
export async function pickSongFile(): Promise<Imported | null> {
  const result = await getDocumentAsync({ type: ['text/plain', '.txt', '.chords'], base64: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const file = asset.file;
  if (!file) throw new Error('The browser did not hand over the file.');
  return checkImport(asset.name, asset.size ?? file.size, () => file.text());
}
