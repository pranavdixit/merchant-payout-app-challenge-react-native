import { zodResolver } from '@hookform/resolvers/zod';
import { randomUUID } from 'expo-crypto';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Container } from '@/components/container';
import { ConfirmPayoutDialog } from '@/components/payout/confirm-payout-dialog';
import { PayoutForm } from '@/components/payout/payout-form';
import { PayoutResult } from '@/components/payout/payout-result';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { getPayoutErrorMessage, isPayoutSettled, usePayout } from '@/hooks/use-payout';
import {
  addScreenshotListener,
  isBiometricAuthenticated,
  isBiometricsNotEnrolledError,
} from '@/modules/screen-security';
import { getPayoutDeviceId } from '@/lib/device';
import { formatAmount } from '@/lib/format';
import {
  normalizeIban,
  payoutSchema,
  requiresBiometrics,
  toMinorUnits,
  type PayoutFormValues,
} from '@/lib/payout';

type Outcome = { status: 'success' | 'error'; message: string };

const OUTCOME_TITLES: Record<Outcome['status'], string> = {
  success: 'Payout Completed',
  error: 'Unable to Process Payout',
};

export default function PayoutsScreen() {
  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutSchema),
    mode: 'onChange',
    defaultValues: { amount: '', currency: 'GBP', iban: '' },
  });
  const payout = usePayout();

  // Values waiting on the merchant's confirmation, and how the last attempt ended
  const [pending, setPending] = useState<PayoutFormValues | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  // One key per logical payout: reused when retrying the same details after an unconfirmed
  // attempt, so the server can de-duplicate it, and dropped once the outcome is known.
  const attempt = useRef<{ key: string; fingerprint: string } | null>(null);

  const authenticating = useRef(false);

  // Remind the merchant to keep financial details private while on this screen
  useFocusEffect(
    useCallback(
      () =>
        addScreenshotListener(() => {
          Alert.alert(
            'Screenshot Detected',
            'Payout details are sensitive. Keep your financial data private and avoid sharing this screen.',
          );
        }),
      [],
    ),
  );

  const confirm = (values: PayoutFormValues) => {
    const fingerprint = JSON.stringify([
      toMinorUnits(values.amount),
      values.currency,
      normalizeIban(values.iban),
    ]);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { key: randomUUID(), fingerprint };
    }
    setPending(values);
  };

  const abort = (message: string) => {
    setPending(null);
    setOutcome({ status: 'error', message });
  };

  /** Large payouts need biometric approval; returns whether the payout may proceed. */
  const authorize = async (minorUnits: number): Promise<boolean> => {
    if (!requiresBiometrics(minorUnits)) {
      return true;
    }
    try {
      if (await isBiometricAuthenticated()) {
        return true;
      }
      abort('Biometric authentication was cancelled.');
    } catch (error) {
      abort(
        isBiometricsNotEnrolledError(error)
          ? 'Set up biometrics in your device settings to send payouts over 1,000.00.'
          : 'Biometric authentication is unavailable. Please try again.',
      );
    }
    return false;
  };

  const submit = async () => {
    if (!pending || !attempt.current || payout.isPending || authenticating.current) {
      return;
    }
    authenticating.current = true;
    const allowed = await authorize(toMinorUnits(pending.amount)).finally(() => {
      authenticating.current = false;
    });
    if (!allowed) {
      return;
    }
    payout.mutate(
      {
        amount: toMinorUnits(pending.amount),
        currency: pending.currency,
        iban: normalizeIban(pending.iban),
        device_id: getPayoutDeviceId(),
        idempotencyKey: attempt.current.key,
      },
      {
        onSuccess: (data) => {
          attempt.current = null;
          setPending(null);
          const amount = formatAmount(data.amount, data.currency);
          if (data.status === 'failed') {
            setOutcome({
              status: 'error',
              message: 'Your payout could not be completed. Please try again.',
            });
          } else {
            setOutcome({
              status: 'success',
              message: `Your payout of ${amount} has been processed successfully.`,
            });
          }
        },
        onError: (error) => {
          // The server answered, so the attempt is settled; otherwise it may have gone through
          if (isPayoutSettled(error)) {
            attempt.current = null;
          }
          setPending(null);
          setOutcome({ status: 'error', message: getPayoutErrorMessage(error) });
        },
      },
    );
  };

  const backToForm = (reset: boolean) => {
    payout.reset();
    setOutcome(null);
    if (reset) {
      form.reset();
    }
  };

  return (
    <Container lightColor={Colors.light.screen} darkColor={Colors.dark.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ThemedText type="title" style={styles.title}>
          {outcome ? 'Payout' : 'Send Payout'}
        </ThemedText>

        {outcome ? (
          <PayoutResult
            status={outcome.status}
            title={OUTCOME_TITLES[outcome.status]}
            message={outcome.message}
            actionLabel={outcome.status === 'error' ? 'Try Again' : 'Create Another Payout'}
            onAction={() => backToForm(outcome.status !== 'error')}
          />
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={styles.content}
          >
            <PayoutForm form={form} onSubmit={confirm} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <ConfirmPayoutDialog
        values={pending}
        submitting={payout.isPending}
        onConfirm={() => void submit()}
        onCancel={() => setPending(null)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginBottom: 32 },
  content: { paddingBottom: 32 },
});
