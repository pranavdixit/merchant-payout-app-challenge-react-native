import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColors } from '@/hooks/use-colors';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID,
}: Props) {
  const colors = useColors();
  const inactive = disabled || loading;

  let backgroundColor = colors.secondary;
  let color = colors.text;
  if (inactive) {
    backgroundColor = colors.disabled;
    color = colors.disabledText;
  } else if (variant === 'primary') {
    backgroundColor = colors.primary;
    color = colors.onPrimary;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={[styles.button, { backgroundColor }, style]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <ThemedText type="defaultSemiBold" style={[styles.title, { color }]}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 18 },
});
