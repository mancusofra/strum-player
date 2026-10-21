// Gives native platforms a localStorage backed by SQLite; on web it is a
// no-op and the browser's localStorage is used.
import 'expo-sqlite/localStorage/install';

import { createSongStore } from './store';

export const songStore = createSongStore(globalThis.localStorage);
