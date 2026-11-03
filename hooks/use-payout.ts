import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError, createPayout } from '@/api/client';
import { merchantQueryKey } from '@/hooks/use-merchant';

export function usePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayout,
    // The balance and recent activity change once a payout goes through
    onSuccess: () => queryClient.invalidateQueries({ queryKey: merchantQueryKey }),
  });
}

/** Whether the server answered with a rejection, so no payout was created and a retry is a fresh one. */
export function isPayoutSettled(error: unknown): boolean {
  return error instanceof ApiError && error.status < 500;
}

/** A message the merchant can act on, for any failure of the payout request. */
export function getPayoutErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    return error.message.endsWith('.') ? error.message : `${error.message}.`;
  }
  // The request may have reached the server, so a blind retry could pay out twice
  return "We couldn't confirm whether the payout went through. Check Activity before trying again.";
}
