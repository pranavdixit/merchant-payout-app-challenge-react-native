import { Controller, type UseFormReturn } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { useColors } from '@/hooks/use-colors';
import { CURRENCIES, type PayoutFormValues } from '@/lib/payout';
import type { Currency } from '@/types/api';

type CurrencyOption = { label: Currency; value: Currency };

const CURRENCY_OPTIONS: CurrencyOption[] = CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));

type Props = {
  form: UseFormReturn<PayoutFormValues>;
  onSubmit: (values: PayoutFormValues) => void;
};

export function PayoutForm({ form, onSubmit }: Props) {
  const colors = useColors();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
  ];

  // Stay quiet until the merchant has typed something
  const errorFor = (field: 'amount' | 'iban', value: string) =>
    value === '' ? undefined : errors[field]?.message;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.amount}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Amount
          </ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange, onBlur } }) => (
              <>
                <TextInput
                  accessibilityLabel="Amount"
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                  value={value}
                  onChangeText={(text) => onChange(text.replace(',', '.'))}
                  onBlur={onBlur}
                  style={inputStyle}
                />
                {errorFor('amount', value) && (
                  <ThemedText style={[styles.hint, { color: colors.danger }]}>
                    {errorFor('amount', value)}
                  </ThemedText>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.currency}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Currency
          </ThemedText>
          <Controller
            control={control}
            name="currency"
            render={({ field: { value, onChange } }) => (
              <Dropdown
                testID="currency-dropdown"
                accessibilityLabel="Currency"
                data={CURRENCY_OPTIONS}
                labelField="label"
                valueField="value"
                value={value}
                onChange={(item: CurrencyOption) => onChange(item.value)}
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                selectedTextStyle={[styles.dropdownText, { color: colors.text }]}
                itemTextStyle={{ color: colors.text }}
                containerStyle={{ backgroundColor: colors.surface, borderColor: colors.border }}
                activeColor={colors.secondary}
                renderRightIcon={() => <ThemedText style={styles.caret}>▾</ThemedText>}
              />
            )}
          />
        </View>
      </View>

      <ThemedText type="defaultSemiBold" style={[styles.label, styles.ibanLabel]}>
        IBAN
      </ThemedText>
      <Controller
        control={control}
        name="iban"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              accessibilityLabel="IBAN"
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="FR1212345123451234567A12310131231231231"
              placeholderTextColor={colors.placeholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={inputStyle}
            />
            {errorFor('iban', value) ? (
              <ThemedText style={[styles.hint, { color: colors.danger }]}>
                {errorFor('iban', value)}
              </ThemedText>
            ) : (
              <ThemedText style={[styles.hint, { color: colors.textMuted }]}>
                Enter the destination bank account IBAN
              </ThemedText>
            )}
          </>
        )}
      />

      <Button
        title="Confirm"
        disabled={!isValid}
        onPress={() => void handleSubmit(onSubmit)()}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  amount: { flex: 1 },
  currency: { width: 130 },
  label: { fontSize: 18, marginBottom: 12 },
  ibanLabel: { marginTop: 28 },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
  },
  dropdown: {
    height: 54,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dropdownText: { fontSize: 20, fontWeight: '600' },
  caret: { fontSize: 18, opacity: 0.6 },
  hint: { fontSize: 15, marginTop: 8 },
  submit: { marginTop: 40 },
});
