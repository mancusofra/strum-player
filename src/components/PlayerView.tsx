import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChordCarousel } from '@/components/ChordCarousel';
import { NotationToggle } from '@/components/NotationToggle';
import { NotePanel } from '@/components/NotePanel';
import { StrumLane } from '@/components/StrumLane';
import type { Notation } from '@/music/notation';
import { useClock } from '@/player/useClock';
import { useMetronome } from '@/player/useMetronome';
import { strumEvents } from '@/song/strums';
import { buildTimeline, changeIndexAt, chordChanges, positionAt } from '@/song/timeline';
import type { Song } from '@/song/types';
import { colors } from '@/theme';

const MIN_BPM = 40;
const MAX_BPM = 200;
// The carousel (or note panel) moves to the next chord or note this many
// beats before it is played, leaving time to change the fingering.
const CHANGE_LEAD_BEATS = 1;

/** The play-along screen for one song: carousel, strumming lane, controls. */
export function PlayerView({ song }: { song: Song }) {
  const timeline = useMemo(() => buildTimeline(song), [song]);
  const strums = useMemo(() => strumEvents(song), [song]);
  const changes = useMemo(() => chordChanges(timeline), [timeline]);
  const [notation, setNotation] = useState<Notation>('letters');
  const [bpm, setBpm] = useState(song.bpm);
  const { beat, playing, toggle, restart, getBeat } = useClock(
    bpm,
    song.beatsPerBar,
    timeline.totalBeats,
  );
  const [click, setClick] = useState(true);
  useMetronome(getBeat, bpm, playing, click, song.beatsPerBar);

  const countingIn = beat < 0;
  const pos = positionAt(timeline, beat);
  // Bars of single notes swap the chord carousel for the note panel.
  const onNotes = !!song.bars[positionAt(timeline, beat + CHANGE_LEAD_BEATS).bar]?.notes;
  const changeBpm = (delta: number) =>
    setBpm((b) => Math.min(MAX_BPM, Math.max(MIN_BPM, b + delta)));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <NotationToggle value={notation} onChange={setNotation} />

      <View style={styles.header}>
        {song.artist ? <Text style={styles.artist}>{song.artist}</Text> : null}
        <Text style={styles.meta}>
          Bar {pos.bar + 1} / {song.bars.length}
        </Text>
      </View>

      <View style={styles.stage}>
        {onNotes ? (
          <NotePanel
            events={strums}
            getBeat={getBeat}
            beat={beat}
            playing={playing}
            notation={notation}
            lead={CHANGE_LEAD_BEATS}
          />
        ) : (
          <ChordCarousel
            changes={changes}
            index={changeIndexAt(changes, beat + CHANGE_LEAD_BEATS)}
            notation={notation}
            style={styles.carousel}
          />
        )}
      </View>

      <StrumLane
        events={strums}
        timeline={timeline}
        notation={notation}
        beat={beat}
        getBeat={getBeat}
        playing={playing}
      />

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

      <Pressable
        onPress={() => setClick((c) => !c)}
        accessibilityRole="switch"
        accessibilityState={{ checked: click }}
        accessibilityLabel="Metronome click"
        style={[styles.pill, click && styles.pillOn]}>
        <Text style={[styles.pillText, click && styles.pillTextOn]}>
          {click ? 'Click on' : 'Click off'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, alignItems: 'center' },
  header: { alignItems: 'center' },
  // full width, past the screen padding, so the next chords fit
  // same height for chords and notes, so the lane below doesn't jump
  stage: { alignSelf: 'stretch', minHeight: 214, justifyContent: 'flex-end' },
  carousel: { alignSelf: 'stretch', marginHorizontal: -16 },
  artist: { color: colors.text, fontSize: 16, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: 14, marginTop: 2 },
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
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  pillOn: { backgroundColor: colors.surface, borderColor: colors.accent },
  pillText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  pillTextOn: { color: colors.text },
  bpm: { color: colors.text, fontSize: 18, fontWeight: '600', minWidth: 80, textAlign: 'center' },
});
