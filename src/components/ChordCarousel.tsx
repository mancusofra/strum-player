import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import { chordLongName, chordSymbol, type Notation } from '@/music/notation';
import { colors } from '@/theme';

const GAP = 14;
// Current chord, then the next two, each a bit smaller and dimmer.
const SIZES = [
  { width: 140, symbol: 40, opacity: 1 },
  { width: 88, symbol: 24, opacity: 0.6 },
  { width: 68, symbol: 20, opacity: 0.4 },
];
// How far the row slides in when the chord changes: from where the next
// chord was to the current slot.
const SLIDE = SIZES[0].width / 2 + GAP + SIZES[1].width / 2;

interface Props {
  current: string;
  upcoming: string[];
  notation: Notation;
}

export function ChordCarousel({ current, upcoming, notation }: Props) {
  const [slide] = useState(() => new Animated.Value(0));
  const previous = useRef(current);

  useEffect(() => {
    if (previous.current === current) return;
    previous.current = current;
    slide.setValue(SLIDE);
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [current, slide]);

  const chords = [current, ...upcoming];
  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.row, { transform: [{ translateX: slide }] }]}>
        {SIZES.map((size, i) => {
          const chord = chords[i];
          return (
            <View key={i} style={[styles.cell, { width: size.width, opacity: size.opacity }]}>
              {chord ? (
                <>
                  <Text style={[styles.symbol, { fontSize: size.symbol }]}>
                    {chordSymbol(chord, notation)}
                  </Text>
                  {i === 0 && (
                    <Text style={styles.longName}>{chordLongName(chord, notation) || ' '}</Text>
                  )}
                  <ChordDiagram chord={chord} width={size.width} />
                </>
              ) : (
                i === 1 && <Text style={styles.end}>End</Text>
              )}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', alignItems: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: GAP },
  cell: { alignItems: 'center' },
  symbol: { color: colors.text, fontWeight: '800' },
  longName: { color: colors.muted, fontSize: 14, marginBottom: 6 },
  end: { color: colors.muted, fontSize: 16, marginBottom: 40 },
});
