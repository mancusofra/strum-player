import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import { NotationToggle } from '@/components/NotationToggle';
import { chordLongName, chordSymbol, type Notation } from '@/music/notation';
import { useClock } from '@/player/useClock';
import { EXAMPLE_SONG } from '@/song/examples';
import { parseSong } from '@/song/parse';
import { buildTimeline, positionAt } from '@/song/timeline';
import { colors } from '@/theme';

const MIN_BPM = 40;
const MAX_BPM = 200;

export default function Player() {
  const song = useMemo(() => parseSong(EXAMPLE_SONG), []);
  const timeline = useMemo(() => buildTimeline(song), [song]);
  const [notation, setNotation] = useState<Notation>('letters');
  const [bpm, setBpm] = useState(song.bpm);
  const { beat, playing, toggle, restart } = useClock(bpm, song.beatsPerBar, timeline.totalBeats);

  const countingIn = beat < 0;
  const pos = positionAt(timeline, beat);
  const current = timeline.chords[pos.chordIndex].chord;
  const next = timeline.chords[pos.chordIndex + 1]?.chord;
  const changeBpm = (delta: number) =>
    setBpm((b) => Math.min(MAX_BPM, Math.max(MIN_BPM, b + delta)));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <NotationToggle value={notation} onChange={setNotation} />

      <View style={styles.header}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.meta}>
          Bar {pos.bar + 1} / {song.bars.length}
        </Text>
      </View>

      <View style={styles.stage}>
        <Text style={styles.symbol}>{chordSymbol(current, notation)}</Text>
        <Text style={styles.longName}>{chordLongName(current, notation) || ' '}</Text>
        <ChordDiagram chord={current} width={180} />
        <Text style={styles.next}>
          {next ? `Next: ${chordSymbol(next, notation)}` : 'Last chord'}
        </Text>
      </View>

      <View style={styles.beats} accessibilityLabel={`Beat ${pos.beatInBar + 1}`}>
        {Array.from({ length: song.beatsPerBar }, (_, i) => (
          <View
            key={i}
            style={[
              styles.beatDot,
              !countingIn && playing && i === pos.beatInBar && styles.beatOn,
              i === 0 && styles.downbeat,
            ]}
          />
        ))}
      </View>
      <Text style={styles.countIn}>{countingIn && playing ? -beat : ' '}</Text>

      <View style={styles.controls}>
        <Pressable onPress={restart} style={styles.secondary} accessibilityLabel="Restart">
          <Text style={styles.secondaryText}>{'⏮\uFE0E'}</Text>
        </Pressable>
        <Pressable
          onPress={toggle}
          style={styles.play}
          accessibilityLabel={playing ? 'Pause' : 'Play'}>
          <Text style={styles.playText}>{playing ? '❚❚' : '▶\uFE0E'}</Text>
        </Pressable>
      </View>

      <View style={styles.tempo}>
        <Pressable
          onPress={() => changeBpm(-5)}
          style={styles.secondary}
          accessibilityLabel="Slower">
          <Text style={styles.secondaryText}>−</Text>
        </Pressable>
        <Text style={styles.bpm}>{bpm} bpm</Text>
        <Pressable
          onPress={() => changeBpm(5)}
          style={styles.secondary}
          accessibilityLabel="Faster">
          <Text style={styles.secondaryText}>+</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, alignItems: 'center' },
  header: { alignItems: 'center' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 14, marginTop: 2 },
  stage: { alignItems: 'center' },
  symbol: { color: colors.text, fontSize: 56, fontWeight: '800' },
  longName: { color: colors.muted, fontSize: 16, marginBottom: 8 },
  next: { color: colors.muted, fontSize: 16, marginTop: 8 },
  beats: { flexDirection: 'row', gap: 14 },
  beatDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surface },
  downbeat: { borderWidth: 2, borderColor: colors.muted },
  beatOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  countIn: { color: colors.accent, fontSize: 28, fontWeight: '800', height: 34 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { color: colors.background, fontSize: 26, fontWeight: '800' },
  secondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  tempo: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  bpm: { color: colors.text, fontSize: 18, fontWeight: '600', minWidth: 80, textAlign: 'center' },
});
