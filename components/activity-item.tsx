import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatAmount } from '@/lib/format';
import type { ActivityItem as ActivityItemData } from '@/types/api';

export function ActivityItem({ item }: { item: ActivityItemData }) {
  return (
    <ThemedView style={styles.row}>
      <ThemedText style={styles.description} numberOfLines={1}>
        {item.description}
      </ThemedText>
      <ThemedText type="defaultSemiBold">{formatAmount(item.amount, item.currency)}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  description: { flex: 1 },
});
