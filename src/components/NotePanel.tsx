import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChordDiagram } from '@/components/ChordDiagram';
import type { ChordShape } from '@/music/chords';
import { noteName, type Notation } from '@/music/notation';
import { fingerFor, positionLabel, type Note } from '@/music/notes';
import type { StrumEvent } from '@/song/strums';
import { colors } from '@/theme';

interface Props {
  events: StrumEvent[];
  getBeat: () => number;
  /** Whole beat; refreshes the panel while stopped. */
  beat: number;
  playing: boolean;
  notation: Notation;
  /** Shows each note this many beats early, like the chord carousel. */
  lead: number;
}

/**
 * Shown during bars of single notes: the note to play (name, string and fret,
 * where to put the finger) and the next two. Follows the clock every frame,
 * since notes can change faster than once per beat.
 */
export function NotePanel({ events, getBeat, beat, playing, notation, lead }: Props) {
  const notes = useMemo(() => events.filter((e) => e.note), [events]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // The note being played or, between notes, the next one.
    const update = () => {
      const b = getBeat() + lead;
      const i = notes.findIndex((e) => b < e.beat + e.length);
      setIndex(i < 0 ? notes.length - 1 : i);
    };
    update();
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      update();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [notes, getBeat, playing, beat, lead]);

  const [current, ...next] = notes.slice(index, index + 3).map((e) => e.note!);
  if (!current) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.current}>
        <Text style={styles.name}>{noteName(current.name, notation)}</Text>
        <Text style={styles.position}>{positionLabel(current)}</Text>
        <ChordDiagram shape={noteShape(current)} width={124} showMuted={false} />
      </View>
      <View style={styles.next}>
        {next.map((n, i) => (
          <View key={i} style={[styles.nextNote, { opacity: i === 0 ? 0.7 : 0.45 }]}>
            <Text style={styles.nextName}>{noteName(n.name, notation)}</Text>
            <Text style={styles.nextPosition}>{`${n.string}:${n.fret}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** A one-note "chord" for the diagram; strings run from low E to high e. */
function noteShape(note: Note): ChordShape {
  const frets = [-1, -1, -1, -1, -1, -1];
  const fingers = [0, 0, 0, 0, 0, 0];
  frets[6 - note.string] = note.fret;
  fingers[6 - note.string] = fingerFor(note);
  return { frets, fingers };
}

const styles = StyleSheet.create({
  panel: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 20 },
  current: { alignItems: 'center' },
  name: { color: colors.text, fontSize: 40, fontWeight: '800' },
  position: { color: colors.muted, fontSize: 14, marginBottom: 6 },
  next: { gap: 14, paddingBottom: 12 },
  nextNote: { alignItems: 'center', minWidth: 56 },
  nextName: { color: colors.text, fontSize: 24, fontWeight: '800' },
  nextPosition: { color: colors.muted, fontSize: 12 },
});
