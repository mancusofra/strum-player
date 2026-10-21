import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { chordSymbol, noteName, type Notation } from '@/music/notation';
import type { StrumEvent } from '@/song/strums';
import type { Timeline } from '@/song/timeline';
import { colors } from '@/theme';

const PX_PER_BEAT = 64;
const HIT_AT = 0.5; // hit line position, as a share of the lane width
const SLOT = 30;
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
 * Strokes scroll right to left and are played as they cross the hit line in
 * the middle. Slots where the chord changes are orange, the rest neutral.
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
      <View pointerEvents="none" style={[styles.hitLine, { left: hitX - 2 }]} />
      <Animated.View style={[styles.row, { transform: [{ translateX: offset }] }]}>
        {bars.map((c) => (
          <View key={`c${c.start}`} style={[styles.chordMark, { left: c.start * PX_PER_BEAT }]}>
            <Text style={styles.chordLabel}>{chordSymbol(c.chord, notation)}</Text>
            {c.start % timeline.beatsPerBar === 0 && <View style={styles.barLine} />}
          </View>
        ))}
        {visible.map(({ e, i }) => (
          <View key={i} style={[styles.slot, { left: e.beat * PX_PER_BEAT - SLOT / 2 }]}>
            <Stroke event={e} active={i === active} notation={notation} />
            <Text style={[styles.count, /\d/.test(e.count) && styles.countBeat]}>{e.count}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function Stroke({
  event,
  active,
  notation,
}: {
  event: StrumEvent;
  active: boolean;
  notation: Notation;
}) {
  if (event.note) {
    return (
      <View style={[styles.strokeBox, styles.noteBox, active && styles.strokeActive]}>
        <Text style={[styles.noteName, active && styles.activeText]}>
          {noteName(event.note.name, notation)}
        </Text>
        <Text style={styles.notePos}>{`${event.note.string}:${event.note.fret}`}</Text>
      </View>
    );
  }
  const label = { D: 'D', U: 'U', x: '×', '-': '·' }[event.stroke];
  const played = event.stroke === 'D' || event.stroke === 'U';
  return (
    <View style={[styles.strokeBox, active && styles.strokeActive]}>
      <Text
        style={[
          styles.stroke,
          !played && styles.unplayed,
          event.change && styles.change,
          active && !event.change && styles.activeText,
        ]}>
        {label}
      </Text>
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
  slot: { position: 'absolute', top: 40, width: SLOT, alignItems: 'center' },
  strokeBox: {
    width: SLOT + 6,
    height: SLOT + 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  strokeActive: { transform: [{ scale: 1.3 }] },
  stroke: { color: colors.text, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  unplayed: { color: colors.muted },
  // wider than a slot so solfège names like Sol# stay on one line
  noteBox: { width: SLOT + 30 },
  noteName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  notePos: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  change: { color: colors.accent },
  activeText: { color: colors.text },
  count: { color: colors.muted, fontSize: 12, marginTop: 6 },
  countBeat: { color: colors.text, fontWeight: '700' },
  hitLine: {
    position: 'absolute',
    top: 32,
    bottom: 8,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.text,
    opacity: 0.3,
  },
});
