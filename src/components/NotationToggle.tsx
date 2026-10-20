import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Notation } from '@/music/notation';
import { colors } from '@/theme';

const OPTIONS: { value: Notation; label: string }[] = [
  { value: 'letters', label: 'C D E' },
  { value: 'solfege', label: 'Do Re Mi' },
];

interface Props {
  value: Notation;
  onChange: (value: Notation) => void;
}

export function NotationToggle({ value, onChange }: Props) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {OPTIONS.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.selected]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  option: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  selected: { backgroundColor: colors.accent },
  label: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  selectedLabel: { color: colors.background },
});
