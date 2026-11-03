import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { useColors } from '@/hooks/use-colors';

type Props = {
  status: 'success' | 'error';
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export function PayoutResult({ status, title, message, actionLabel, onAction }: Props) {
  const colors = useColors();
  const isError = status === 'error';
  const tone = isError ? colors.danger : colors.text;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {status === 'success' && (
        <View style={[styles.badge, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={44} color={colors.onPrimary} />
        </View>
      )}
      {isError && <Ionicons name="close" size={72} color={colors.danger} />}
      <ThemedText type="subtitle" style={[styles.title, { color: tone }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { color: isError ? colors.danger : colors.textMuted }]}>
        {message}
      </ThemedText>
      <Button title={actionLabel} onPress={onAction} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 32, fontSize: 28, lineHeight: 36, textAlign: 'center' },
  message: { marginTop: 24, fontSize: 18, lineHeight: 28, textAlign: 'center' },
  action: { marginTop: 48, minWidth: 240 },
});
