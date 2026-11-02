import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatAmount, formatDate } from '@/lib/format';
import type { ActivityItem as ActivityItemData } from '@/types/api';

type Props = {
  item: ActivityItemData;
  detailed?: boolean;
};

export function ActivityItem({ item, detailed = false }: Props) {
  return (
    <ThemedView style={styles.row}>
      <ThemedView style={styles.main}>
        <ThemedText numberOfLines={1}>{item.description}</ThemedText>
        {detailed && (
          <ThemedText style={styles.meta}>
            {item.type} - {formatDate(item.date)}
          </ThemedText>
        )}
      </ThemedView>
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
  main: { flex: 1 },
  meta: { fontSize: 13, opacity: 0.6, textTransform: 'capitalize' },
});
