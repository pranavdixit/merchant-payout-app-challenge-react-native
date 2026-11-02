import type { Currency } from '@/types/api';

/** @description Formats an amount in minor units (pence/cents) with its currency symbol.
 * @param minor - The amount in minor units (e.g., pence or cents).
 * @param currency - The currency code (e.g., 'GBP', 'USD').
 * @returns A string representing the formatted amount with the currency symbol.  
 */
export function formatAmount(minor: number, currency: Currency): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(minor / 100);
}
