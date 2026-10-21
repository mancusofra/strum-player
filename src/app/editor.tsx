import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { confirmDestructive } from '@/components/dialogs';
import { songStore } from '@/library';
import { getDraft } from '@/library/imported';
import { checkSong, findSong } from '@/library/songs';
import { NEW_SONG_TEMPLATE } from '@/song/examples';
import { colors } from '@/theme';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

/**
 * Write or paste a song. `id` edits a saved song, `from` starts from a copy
 * of another one, `draft` from an imported file.
 */
export default function Editor() {
  const { id, from, draft } = useLocalSearchParams<{
    id?: string;
    from?: string;
    draft?: string;
  }>();
  const editing = id ? songStore.get(id) : undefined;
  const [text, setText] = useState(
    () =>
      editing?.text ??
      findSong(songStore, from)?.text ??
      (draft ? getDraft() : undefined) ??
      NEW_SONG_TEMPLATE,
  );
  const checked = useMemo(() => checkSong(text), [text]);

  const save = () => songStore.save(text, editing?.id);
  const remove = async () => {
    if (!editing) return;
    const title = checked.song?.title ?? 'this song';
    if (await confirmDestructive('Delete song?', `“${title}” will be removed.`, 'Delete')) {
      songStore.remove(editing.id);
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: editing ? 'Edit song' : draft ? 'Imported song' : 'New song' }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          style={styles.input}
          accessibilityLabel="Song text"
          placeholder="Paste or write your song here"
          placeholderTextColor={colors.muted}
        />

        <View style={[styles.status, checked.error ? styles.statusError : styles.statusOk]}>
          <Text style={[styles.statusText, checked.error && styles.statusTextError]}>
            {checked.song
              ? `✓ ${checked.song.title} · ${checked.song.bpm} bpm · ${checked.song.bars.length} bars`
              : checked.error}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            disabled={!!checked.error}
            onPress={() => {
              save();
              router.back();
            }}
            style={[styles.button, checked.error && styles.disabled]}
            accessibilityRole="button">
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
          <Pressable
            disabled={!!checked.error}
            onPress={() => router.replace({ pathname: '/player', params: { id: save() } })}
            style={[styles.button, styles.primary, checked.error && styles.disabled]}
            accessibilityRole="button">
            <Text style={[styles.buttonText, styles.primaryText]}>Save and play</Text>
          </Pressable>
        </View>

        {editing && (
          <Pressable onPress={remove} style={styles.delete} accessibilityRole="button">
            <Text style={styles.deleteText}>Delete song</Text>
          </Pressable>
        )}

        <Text style={styles.help}>
          Headers: title, artist, bpm, time (4/4), pattern. Bars: | G | D Em | % |. Pattern: D down,
          U up, x muted, - rest. Lines starting with # are comments.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, maxWidth: 720, width: '100%', alignSelf: 'center' },
  input: {
    minHeight: 280,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: MONO,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  status: { padding: 12, borderRadius: 10, borderWidth: 1 },
  statusOk: { borderColor: colors.surface },
  statusError: { borderColor: colors.accent },
  statusText: { color: colors.muted, fontSize: 14 },
  statusTextError: { color: colors.accent },
  buttons: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  primary: { backgroundColor: colors.accent },
  disabled: { opacity: 0.4 },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  primaryText: { color: colors.background },
  delete: { alignSelf: 'center', padding: 12 },
  deleteText: { color: colors.muted, fontSize: 15, textDecorationLine: 'underline' },
  help: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
