//import liraries
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from './themed-view';

type Props = {
  children: React.ReactNode;
  lightColor?: string;
  darkColor?: string;
};

export function Container({ children, lightColor, darkColor }: Props) {
  return (
    <ThemedView style={styles.container} lightColor={lightColor} darkColor={darkColor}>
      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
});
