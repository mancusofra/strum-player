import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PlayerView } from '@/components/PlayerView';
import { songStore } from '@/library';
import { checkSong, findSong } from '@/library/songs';
import { EXAMPLES } from '@/song/examples';
import { colors } from '@/theme';

export default function Player() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entry = useMemo(
    () => (id ? findSong(songStore, id) : { id: EXAMPLES[0].id, text: EXAMPLES[0].text }),
    [id],
  );
  const checked = useMemo(() => entry && checkSong(entry.text), [entry]);

  if (!entry || !checked?.song) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Player' }} />
        <Text style={styles.message}>
          {entry ? `This song can't be played: ${checked?.error}` : 'Song not found.'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: checked.song.title }} />
      <PlayerView key={entry.id} song={checked.song} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: colors.muted, fontSize: 16, textAlign: 'center' },
});
