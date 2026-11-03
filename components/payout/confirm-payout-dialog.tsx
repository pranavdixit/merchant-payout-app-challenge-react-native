import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { useColors } from '@/hooks/use-colors';
import { formatAmount } from '@/lib/format';
import { maskIban, normalizeIban, toMinorUnits, type PayoutFormValues } from '@/lib/payout';

type Props = {
  /** The payout awaiting confirmation; the dialog is hidden when null. */
  values: PayoutFormValues | null;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmPayoutDialog({ values, submitting, onConfirm, onCancel }: Props) {
  const colors = useColors();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={values !== null}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        {values && (
          <View
            testID="confirm-dialog"
            accessibilityViewIsModal
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <ThemedText type="subtitle" style={styles.title}>
              Confirm Payout
            </ThemedText>

            <Row
              label="Amount:"
              value={formatAmount(toMinorUnits(values.amount), values.currency)}
            />
            <Row label="Currency:" value={values.currency} />
            <Row label="IBAN:" value={maskIban(normalizeIban(values.iban))} />

            <View style={styles.actions}>
              <Button
                title="Cancel"
                variant="secondary"
                disabled={submitting}
                onPress={onCancel}
                style={styles.action}
                testID="confirm-dialog-cancel"
              />
              <Button
                title="Confirm"
                loading={submitting}
                onPress={onConfirm}
                style={styles.action}
                testID="confirm-dialog-confirm"
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useColors();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <ThemedText style={[styles.label, { color: colors.textMuted }]}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.value} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { borderRadius: 24, padding: 28 },
  title: { textAlign: 'center', fontSize: 24, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 18 },
  value: { flexShrink: 1, fontSize: 18 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 28 },
  action: { flex: 1 },
});
