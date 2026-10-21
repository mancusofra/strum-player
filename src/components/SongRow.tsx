import { Pressable, StyleSheet, Text, View } from 'react-native';

import { checkSong } from '@/library/songs';
import { colors } from '@/theme';

interface Props {
  text: string;
  onPlay: () => void;
  actionLabel: string;
  onAction: () => void;
}

export function SongRow({ text, onPlay, actionLabel, onAction }: Props) {
  const { song } = checkSong(text);
  const details = song
    ? [
        song.artist,
        `${song.bpm} bpm`,
        `${song.beatsPerBar}/${song.beatUnit}`,
        `${song.bars.length} bars`,
      ]
        .filter(Boolean)
        .join(' · ')
    : "Can't read this song, open it to fix it";

  return (
    <View style={styles.row}>
      <Pressable
        onPress={song ? onPlay : onAction}
        style={styles.main}
        accessibilityRole="button"
        accessibilityLabel={song ? `Play ${song.title}` : 'Fix song'}>
        <Text style={styles.title} numberOfLines={1}>
          {song?.title ?? 'Untitled'}
        </Text>
        <Text style={[styles.details, !song && styles.error]} numberOfLines={1}>
          {details}
        </Text>
      </Pressable>
      <Pressable onPress={onAction} style={styles.action} accessibilityRole="button">
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  main: { flex: 1, paddingVertical: 14, paddingLeft: 16, paddingRight: 8 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  details: { color: colors.muted, fontSize: 13, marginTop: 3 },
  error: { color: colors.accent },
  action: { paddingHorizontal: 16, paddingVertical: 18 },
  actionText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
});
