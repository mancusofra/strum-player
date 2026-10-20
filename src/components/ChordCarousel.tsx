import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import { chordLongName, chordSymbol, type Notation } from '@/music/notation';
import type { TimedChord } from '@/song/timeline';
import { colors } from '@/theme';

const WIDTH = 124; // full-size cell, used by the current chord
const HEIGHT = 180;
const GAP = 10;

// Look of a cell by its distance from the current chord: -1 is the chord
// just played, 0 the current one, 1 and 2 the next two, 3 the one coming in.
const DISTANCE = [-1, 0, 1, 2, 3];
const SCALE = [0.45, 1, 0.5, 0.36, 0.3];
const OPACITY = [0, 1, 0.7, 0.45, 0];
const OFFSET = (() => {
  const out = [0, 0, 0, 0, 0];
  out[0] = -(WIDTH / 2 + GAP + (WIDTH * SCALE[0]) / 2);
  for (let i = 2; i < DISTANCE.length; i++) {
    out[i] = out[i - 1] + (WIDTH * SCALE[i - 1]) / 2 + GAP + (WIDTH * SCALE[i]) / 2;
  }
  return out;
})();

interface Props {
  changes: TimedChord[];
  index: number;
  notation: Notation;
  style?: StyleProp<ViewStyle>;
}

/**
 * The current chord in the middle and the next two on its right. Every chord
 * sits on one track; on a change the track eases one step left and each
 * chord grows or shrinks with its distance from the middle.
 */
export function ChordCarousel({ changes, index, notation, style }: Props) {
  const [width, setWidth] = useState(0);
  const [position] = useState(() => new Animated.Value(index));
  const shown = useRef(index);

  useEffect(() => {
    const step = Math.abs(index - shown.current);
    shown.current = index;
    if (step === 0) return;
    if (step > 1) {
      position.setValue(index); // restart or a jump: no long slide
      return;
    }
    Animated.timing(position, {
      toValue: index,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [index, position]);

  const current = changes[index]?.chord;
  const cells = [];
  for (let i = Math.max(0, index - 1); i <= Math.min(changes.length - 1, index + 3); i++) {
    // `position` runs from i - 3 (cell three to the right) to i + 1 (gone left).
    const input = DISTANCE.map((d) => i - d).reverse();
    const pick = (values: number[]) =>
      position.interpolate({
        inputRange: input,
        outputRange: [...values].reverse(),
        extrapolate: 'clamp',
      });
    const scale = pick(SCALE);
    cells.push(
      <Animated.View
        key={i}
        style={[
          styles.cell,
          {
            left: width / 2 - WIDTH / 2,
            opacity: pick(OPACITY),
            transform: [
              { translateX: pick(OFFSET) },
              // keep the cells' bottoms on one line while they scale
              { translateY: pick(SCALE.map((s) => ((1 - s) * HEIGHT) / 2)) },
              { scale },
            ],
          },
        ]}>
        <Text style={styles.symbol}>{chordSymbol(changes[i].chord, notation)}</Text>
        <ChordDiagram chord={changes[i].chord} width={WIDTH} />
      </Animated.View>,
    );
  }

  return (
    <View style={style}>
      <View
        style={styles.track}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && cells}
      </View>
      <Text style={styles.longName}>{(current && chordLongName(current, notation)) || ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: HEIGHT, overflow: 'hidden' },
  cell: {
    position: 'absolute',
    top: 0,
    width: WIDTH,
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  symbol: { color: colors.text, fontSize: 40, fontWeight: '800', marginBottom: 2 },
  longName: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 6 },
});
