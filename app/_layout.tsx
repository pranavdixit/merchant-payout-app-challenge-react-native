import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMSW } from '../mocks/useMSW';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize MSW in development mode and wait for it to be ready
  const isMSWReady = useMSW();

  // Don't render the app until MSW is ready (in dev mode)
  if (!isMSWReady) {
    return null;
  }

  //TODO: Add splash screen or loading indicator here if needed while MSW is initializing

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
