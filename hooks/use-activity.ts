import { useInfiniteQuery } from '@tanstack/react-query';

import { getPaginatedActivities } from '@/api/client';

export const activityQueryKey = ['merchant', 'activity'] as const;

export function useActivity() {
  return useInfiniteQuery({
    queryKey: activityQueryKey,
    queryFn: ({ pageParam }) => getPaginatedActivities(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  });
}
