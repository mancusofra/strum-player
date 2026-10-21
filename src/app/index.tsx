import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { notify } from '@/components/dialogs';
import { SongRow } from '@/components/SongRow';
import { songStore } from '@/library';
import { setDraft } from '@/library/imported';
import { pickSongFile } from '@/library/importFile';
import { librarySongs, type LibrarySong } from '@/library/songs';
import { colors } from '@/theme';

export default function Library() {
  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<LibrarySong[]>([]);
  // Reload whenever the screen comes back, e.g. after saving in the editor.
  useFocusEffect(useCallback(() => setSongs(librarySongs(songStore)), []));

  const mine = songs.filter((s) => !s.builtIn);
  const examples = songs.filter((s) => s.builtIn);
  const play = (id: string) => router.push({ pathname: '/player', params: { id } });
  const importFile = async () => {
    try {
      const picked = await pickSongFile();
      if (!picked) return;
      if ('error' in picked) return notify("Can't import", picked.error);
      setDraft(picked.text);
      router.push({ pathname: '/editor', params: { draft: '1' } });
    } catch (e) {
      notify("Can't import", e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 32 }]}>
      <Text style={styles.title}>Strum Player</Text>
      <Text style={styles.subtitle}>Play along with chords and strumming</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/editor')}
          style={styles.newButton}
          accessibilityRole="button">
          <Text style={styles.newButtonText}>+ New song</Text>
        </Pressable>
        <Pressable onPress={importFile} style={styles.importButton} accessibilityRole="button">
          <Text style={styles.importButtonText}>Import file</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Your songs</Text>
      {mine.length === 0 ? (
        <Text style={styles.empty}>
          Write or paste a song with “New song”, import a text file, or edit a copy of an example.
        </Text>
      ) : (
        mine.map((s) => (
          <SongRow
            key={s.id}
            text={s.text}
            onPlay={() => play(s.id)}
            actionLabel="Edit"
            onAction={() => router.push({ pathname: '/editor', params: { id: s.id } })}
          />
        ))
      )}

      <Text style={styles.section}>Examples</Text>
      {examples.map((s) => (
        <SongRow
          key={s.id}
          text={s.text}
          onPlay={() => play(s.id)}
          actionLabel="Copy"
          onAction={() => router.push({ pathname: '/editor', params: { from: s.id } })}
        />
      ))}
      <View style={styles.bottom} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 10,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 16, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  newButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  newButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  importButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  importButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  section: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
  },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  bottom: { height: 24 },
});
