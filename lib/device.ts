import { getDeviceId } from '@/modules/screen-security';

/** The native device identifier, or `undefined` when the platform doesn't provide one. */
export function getPayoutDeviceId(): string | undefined {
  try {
    return getDeviceId() || undefined;
  } catch {
    // A missing identifier must not block a payout from client the backend can decide to allow or disallow the transactions.
    return undefined;
  }
}
