import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { findChord, type ChordShape } from '@/music/chords';
import { layoutChord } from '@/music/diagram';
import { colors } from '@/theme';

// Geometry in viewBox units; the SVG scales to `width`.
const STRING_GAP = 14;
const FRET_GAP = 18;
const LEFT = 20; // room for the "3fr" label
const RIGHT = 10;
const TOP = 22; // room for the O / X markers
const BOTTOM = 6;
const DOT = 6;
const FONT = 'sans-serif';
const GRID_W = STRING_GAP * 5;
const VIEW_W = LEFT + GRID_W + RIGHT;

const x = (string: number) => LEFT + string * STRING_GAP;
const rowY = (row: number) => TOP + (row - 0.5) * FRET_GAP;

interface Props {
  /** Chord name to look up, or `shape` to draw directly. */
  chord?: string;
  shape?: ChordShape;
  width?: number;
  /** Draw × over strings not played (off for a single note). */
  showMuted?: boolean;
}

export function ChordDiagram({ chord = '', shape: given, width = 120, showMuted = true }: Props) {
  const shape = given ?? findChord(chord);
  if (!shape) {
    return (
      <View style={[styles.missing, { width, height: width * 1.1 }]}>
        <Text style={styles.missingText}>No diagram for {chord}</Text>
      </View>
    );
  }

  const { baseFret, rows, strings, dots, barres } = layoutChord(shape);
  const gridH = rows * FRET_GAP;
  const viewH = TOP + gridH + BOTTOM;

  return (
    <Svg
      width={width}
      height={(width * viewH) / VIEW_W}
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      accessibilityLabel={chord ? `${chord} chord diagram` : 'Fretboard diagram'}>
      {/* Frets */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <Line
          key={`f${i}`}
          x1={LEFT}
          x2={LEFT + GRID_W}
          y1={TOP + i * FRET_GAP}
          y2={TOP + i * FRET_GAP}
          stroke={colors.muted}
          strokeWidth={1}
        />
      ))}
      {baseFret === 1 ? (
        <Rect x={LEFT - 1} y={TOP - 3} width={GRID_W + 2} height={4} fill={colors.text} />
      ) : (
        <SvgText
          x={LEFT - 5}
          y={rowY(1) + 3}
          fontSize={8}
          fontFamily={FONT}
          fill={colors.muted}
          textAnchor="end">{`${baseFret}fr`}</SvgText>
      )}

      {/* Strings, thicker for the bass */}
      {strings.map((_, s) => (
        <Line
          key={`s${s}`}
          x1={x(s)}
          x2={x(s)}
          y1={TOP}
          y2={TOP + gridH}
          stroke={colors.text}
          strokeWidth={1.6 - s * 0.15}
        />
      ))}

      {/* Open / muted markers */}
      {strings.map((state, s) =>
        state === 'open' ? (
          <Circle
            key={`o${s}`}
            cx={x(s)}
            cy={TOP - 11}
            r={3.5}
            stroke={colors.text}
            strokeWidth={1.2}
            fill="none"
          />
        ) : state === 'muted' && showMuted ? (
          <SvgText
            key={`m${s}`}
            x={x(s)}
            y={TOP - 7}
            fontSize={12}
            fontFamily={FONT}
            fill={colors.text}
            textAnchor="middle">
            ×
          </SvgText>
        ) : null,
      )}

      {barres.map((b) => (
        <Rect
          key={`b${b.row}-${b.from}`}
          x={x(b.from) - DOT}
          y={rowY(b.row) - DOT}
          width={x(b.to) - x(b.from) + DOT * 2}
          height={DOT * 2}
          rx={DOT}
          fill={colors.accent}
        />
      ))}
      {barres.map((b) => (
        <SvgText
          key={`bt${b.row}-${b.from}`}
          x={x(b.from)}
          y={rowY(b.row) + 3}
          fontSize={8}
          fontFamily={FONT}
          fontWeight="bold"
          fill={colors.background}
          textAnchor="middle">
          {String(b.finger)}
        </SvgText>
      ))}

      {dots.map((d) => (
        <Circle
          key={`d${d.string}`}
          cx={x(d.string)}
          cy={rowY(d.row)}
          r={DOT}
          fill={colors.accent}
        />
      ))}
      {dots.map((d) =>
        d.finger ? (
          <SvgText
            key={`dt${d.string}`}
            x={x(d.string)}
            y={rowY(d.row) + 3}
            fontSize={8}
            fontFamily={FONT}
            fontWeight="bold"
            fill={colors.background}
            textAnchor="middle">
            {String(d.finger)}
          </SvgText>
        ) : null,
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    borderRadius: 8,
    padding: 8,
  },
  missingText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
