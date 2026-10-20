import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function Player() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>The player will show up here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  placeholder: { color: colors.muted, fontSize: 16 },
});
