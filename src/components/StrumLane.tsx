import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { chordSymbol, type Notation } from '@/music/notation';
import type { StrumEvent } from '@/song/strums';
import type { Timeline } from '@/song/timeline';
import { colors } from '@/theme';

const PX_PER_BEAT = 64;
const HIT_AT = 0.25; // hit line position, as a share of the lane width
const ARROW = 30;
const HEIGHT = 132;

interface Props {
  events: StrumEvent[];
  timeline: Timeline;
  notation: Notation;
  /** Whole beat, used to pick which slots to render. */
  beat: number;
  getBeat: () => number;
  playing: boolean;
}

/**
 * Strokes scroll right to left and are played as they cross the hit line.
 * The row moves through an Animated.Value set on every frame, so React only
 * re-renders when the whole beat or the active slot changes.
 */
export function StrumLane({ events, timeline, notation, beat, getBeat, playing }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(-1);
  const offset = useRef(new Animated.Value(0)).current;
  const hitX = width * HIT_AT;

  useEffect(() => {
    const update = () => {
      const b = getBeat();
      offset.setValue(hitX - b * PX_PER_BEAT);
      setActive(events.findIndex((e) => b >= e.beat && b < e.beat + e.length));
    };
    update();
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      update();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [events, getBeat, hitX, offset, playing, beat]);

  // Only the slots near the screen are mounted.
  const from = beat - (hitX / PX_PER_BEAT + 2);
  const to = beat + ((width - hitX) / PX_PER_BEAT + 2);
  const visible = useMemo(
    () => events.map((e, i) => ({ e, i })).filter(({ e }) => e.beat >= from && e.beat <= to),
    [events, from, to],
  );
  const bars = useMemo(
    () => timeline.chords.filter((c) => c.start >= from && c.start <= to),
    [timeline, from, to],
  );

  return (
    <View
      style={styles.lane}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel="Strumming lane">
      <Animated.View style={[styles.row, { transform: [{ translateX: offset }] }]}>
        {bars.map((c) => (
          <View key={`c${c.start}`} style={[styles.chordMark, { left: c.start * PX_PER_BEAT }]}>
            <Text style={styles.chordLabel}>{chordSymbol(c.chord, notation)}</Text>
            {c.start % timeline.beatsPerBar === 0 && <View style={styles.barLine} />}
          </View>
        ))}
        {visible.map(({ e, i }) => (
          <View key={i} style={[styles.slot, { left: e.beat * PX_PER_BEAT - ARROW / 2 }]}>
            <Stroke stroke={e.stroke} active={i === active} />
            <Text style={[styles.count, /\d/.test(e.count) && styles.countBeat]}>{e.count}</Text>
          </View>
        ))}
      </Animated.View>
      <View pointerEvents="none" style={[styles.hitLine, { left: hitX - 2 }]} />
    </View>
  );
}

function Stroke({ stroke, active }: { stroke: StrumEvent['stroke']; active: boolean }) {
  if (stroke === '-') {
    return (
      <View style={styles.strokeBox}>
        <View style={[styles.rest, active && styles.restActive]} />
      </View>
    );
  }
  if (stroke === 'x') {
    return (
      <View style={styles.strokeBox}>
        <Text style={[styles.mute, active && styles.activeText]}>×</Text>
      </View>
    );
  }
  const color = stroke === 'D' ? colors.accent : colors.text;
  return (
    <View style={[styles.strokeBox, active && styles.strokeActive]}>
      <Svg
        width={ARROW}
        height={ARROW}
        viewBox="0 0 24 24"
        style={stroke === 'U' ? styles.up : undefined}>
        <Path
          d="M12 2v16M5 12l7 8 7-8"
          stroke={color}
          strokeWidth={active ? 3.6 : 2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    alignSelf: 'stretch',
    height: HEIGHT,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  row: StyleSheet.absoluteFill,
  chordMark: { position: 'absolute', top: 0, bottom: 0 },
  chordLabel: {
    position: 'absolute',
    top: 8,
    left: 6,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  barLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.muted,
    opacity: 0.5,
  },
  slot: { position: 'absolute', top: 40, width: ARROW, alignItems: 'center' },
  strokeBox: {
    width: ARROW + 6,
    height: ARROW + 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  strokeActive: { transform: [{ scale: 1.25 }] },
  up: { transform: [{ rotate: '180deg' }] },
  rest: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted },
  restActive: { backgroundColor: colors.text },
  mute: { color: colors.muted, fontSize: 28, fontWeight: '700', lineHeight: 32 },
  activeText: { color: colors.text },
  count: { color: colors.muted, fontSize: 12, marginTop: 6 },
  countBeat: { color: colors.text, fontWeight: '700' },
  hitLine: {
    position: 'absolute',
    top: 32,
    bottom: 8,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
});
