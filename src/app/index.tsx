import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strum Player</Text>
      <Text style={styles.subtitle}>Play along with chords and strumming</Text>
      <Link href="/player" asChild>
        {/* Link's Slot drops function styles on web, so keep this one static. */}
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Open player</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8 },
  button: {
    marginTop: 32,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
