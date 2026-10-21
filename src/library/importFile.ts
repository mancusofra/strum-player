import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';

import { checkImport, type Imported } from './imported';

/** Lets the user pick a text file and reads it; null if they cancel. */
export async function pickSongFile(): Promise<Imported | null> {
  const result = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return checkImport(asset.name, asset.size, () => new File(asset.uri).text());
}
