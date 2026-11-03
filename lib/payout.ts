import currency from 'currency.js';
import { electronicFormatIBAN, isValidIBAN } from 'ibantools';
import { z } from 'zod';

import type { Currency } from '@/types/api';

export const CURRENCIES: readonly Currency[] = ['GBP', 'EUR'];

/** Payouts above this (1,000.00 in either currency) need biometric approval. */
export const BIOMETRIC_THRESHOLD_MINOR = 100000;

/** Digits with an optional decimal part of up to two places. */
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Converts a decimal string ("999.99") to minor units (99999). */
export function toMinorUnits(amount: string): number {
  return currency(amount).intValue;
}

export function requiresBiometrics(minorUnits: number): boolean {
  return minorUnits > BIOMETRIC_THRESHOLD_MINOR;
}

/** Strips spaces and dashes and upper-cases, e.g. "gb29 nwbk ..." -> "GB29NWBK...". */
export function normalizeIban(value: string): string {
  return electronicFormatIBAN(value) ?? '';
}

/** Keeps the first four and last four characters, e.g. "FR12**********1231". */
export function maskIban(iban: string): string {
  if (iban.length <= 8) {
    return iban;
  }
  return `${iban.slice(0, 4)}${'*'.repeat(iban.length - 8)}${iban.slice(-4)}`;
}

export const payoutSchema = z.object({
  amount: z
    .string()
    .regex(AMOUNT_PATTERN, 'Enter a valid amount')
    .refine((value) => toMinorUnits(value) > 0, 'Amount must be greater than zero'),
  currency: z.enum(['GBP', 'EUR']),
  iban: z.string().refine((value) => isValidIBAN(normalizeIban(value)), 'Enter a valid IBAN'),
});

export type PayoutFormValues = z.infer<typeof payoutSchema>;
