import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { ActivityItem } from '@/components/activity-item';
import { Container } from '@/components/container';
import { ThemedText } from '@/components/themed-text';
import { useMerchant } from '@/hooks/use-merchant';

export default function ModalScreen() {
  const { data, isLoading } = useMerchant();

  return (
    <Container>
      <ThemedText type="title" style={styles.title}>
        Activity
      </ThemedText>
      {!data && isLoading ? (
        <ActivityIndicator accessibilityLabel="Loading" />
      ) : !data ? (
        <ThemedText>Something went wrong loading activity.</ThemedText>
      ) : (
        <FlatList
          style={styles.list}
          data={data.activity}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityItem item={item} />}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 16 },
  list: { flex: 1 },
});
