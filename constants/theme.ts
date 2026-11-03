/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    screen: '#F2F2F2',
    surface: '#FFFFFF',
    border: '#E0E0E0',
    textMuted: '#6B7075',
    placeholder: '#9BA1A6',
    primary: '#0A7EA4',
    onPrimary: '#FFFFFF',
    secondary: '#EFEFEF',
    disabled: '#DDDDDD',
    disabledText: '#A0A0A0',
    success: '#22C55E',
    danger: '#EF4444',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    screen: '#0E0F10',
    surface: '#1C1E20',
    border: '#34383B',
    textMuted: '#9BA1A6',
    placeholder: '#687076',
    primary: '#0A7EA4',
    onPrimary: '#FFFFFF',
    secondary: '#2A2D2F',
    disabled: '#2A2D2F',
    disabledText: '#687076',
    success: '#22C55E',
    danger: '#F87171',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
