import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/container';

export default function PayoutsScreen() {
  return (
    <Container>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Initiate Payout</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Payout Amount</ThemedText>
      </ThemedView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
});
