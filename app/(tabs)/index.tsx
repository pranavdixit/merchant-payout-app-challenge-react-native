import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ActivityItem } from '@/components/activity-item';
import { Container } from '@/components/container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMerchant } from '@/hooks/use-merchant';
import { formatAmount } from '@/lib/format';

export default function HomeScreen() {
  const { data, isLoading, isFetching, refetch } = useMerchant();

  let body;
  if (!data && isLoading) {
    body = <ActivityIndicator accessibilityLabel="Loading" style={styles.section} />;
  } else if (!data) {
    body = (
      <ThemedView style={styles.section}>
        <ThemedText>Something went wrong loading your account.</ThemedText>
        {isFetching ? (
          <ActivityIndicator accessibilityLabel="Retrying" style={styles.button} />
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={styles.button}
          >
            <ThemedText type="link">Try again</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  } else {
    body = (
      <>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account Balance</ThemedText>
          <ThemedText>Available</ThemedText>
          <ThemedText type="title">
            {formatAmount(data.available_balance, data.currency)}
          </ThemedText>
          <ThemedText>Pending</ThemedText>
          <ThemedText type="defaultSemiBold">
            {formatAmount(data.pending_balance, data.currency)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          {data.activity.slice(0, 3).map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/modal')}
            style={styles.button}
          >
            <ThemedText type="link">Show more</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  return (
    <Container>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Business Account</ThemedText>
      </ThemedView>
      {body}
    </Container>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  section: { marginBottom: 24 },
  button: { paddingVertical: 12 },
});
