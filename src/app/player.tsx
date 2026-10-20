import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import { NotationToggle } from '@/components/NotationToggle';
import { chordLongName, chordSymbol, type Notation } from '@/music/notation';
import { colors } from '@/theme';

// Temporary preview grid until the player follows a song.
const PREVIEW = ['C', 'G', 'Am', 'Em', 'D7', 'F', 'Bm', 'Cm', 'Dm7', 'G/B', 'Xyz'];

export default function Player() {
  const [notation, setNotation] = useState<Notation>('letters');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <NotationToggle value={notation} onChange={setNotation} />
      <View style={styles.grid}>
        {PREVIEW.map((chord) => (
          <View key={chord} style={styles.cell}>
            <Text style={styles.symbol}>{chordSymbol(chord, notation)}</Text>
            <Text style={styles.longName} numberOfLines={2}>
              {chordLongName(chord, notation) || ' '}
            </Text>
            <ChordDiagram chord={chord} width={110} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  cell: { alignItems: 'center', width: 110 },
  symbol: { color: colors.text, fontSize: 20, fontWeight: '700' },
  longName: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    minHeight: 32,
    marginBottom: 4,
  },
});
