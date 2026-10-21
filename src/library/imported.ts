export type Imported = { name: string; text: string } | { name: string; error: string };

// Far bigger than any song sheet; stops a wrong pick from freezing the editor.
export const MAX_IMPORT_BYTES = 200_000;

/** Reads a picked file unless it is too big or not text. */
export async function checkImport(
  name: string,
  size: number | undefined,
  read: () => Promise<string>,
): Promise<Imported> {
  if (size !== undefined && size > MAX_IMPORT_BYTES) {
    return { name, error: `${name} is too big for a song file.` };
  }
  const text = await read();
  // A NUL character means binary data, not a text file.
  if (text.includes('\0')) return { name, error: `${name} is not a text file.` };
  return { name, text: text.replace(/^﻿/, '') };
}

// Imported text waiting for the editor; route params would be too long.
let draft: string | undefined;
export const setDraft = (text: string) => void (draft = text);
export const getDraft = () => draft;
