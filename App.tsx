import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strum Player</Text>
      <Text style={styles.subtitle}>Scheletro pronto</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#f2f2f2', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#6b7280', fontSize: 16, marginTop: 8 },
});
