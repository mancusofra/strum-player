import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import { colors } from '@/theme';

// Temporary preview grid until the player follows a song.
const PREVIEW = ['C', 'G', 'Am', 'Em', 'D7', 'F', 'Bm', 'Cm', 'Dm7', 'G/B', 'Xyz'];

export default function Player() {
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {PREVIEW.map((chord) => (
        <View key={chord} style={styles.cell}>
          <Text style={styles.name}>{chord}</Text>
          <ChordDiagram chord={chord} width={110} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  cell: { alignItems: 'center', width: 110 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
});
