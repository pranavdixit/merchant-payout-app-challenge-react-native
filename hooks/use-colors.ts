import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** The theme palette for the current colour scheme. */
export function useColors() {
  return Colors[useColorScheme() ?? 'light'];
}
