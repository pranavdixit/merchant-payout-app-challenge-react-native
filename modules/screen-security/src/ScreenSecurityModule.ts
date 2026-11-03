import { requireNativeModule } from 'expo';

/** The native surface of `ScreenSecurity`. Emits `onScreenshotTaken` when the user captures the screen. */
interface ScreenSecurityNativeModule {
  addListener(eventName: 'onScreenshotTaken', listener: () => void): { remove(): void };
  /** A unique identifier for this device, or an empty string if the platform withholds one. */
  getDeviceId(): string;
  /** Resolves whether the user passed biometrics; rejects with code `BIOMETRICS_NOT_ENROLLED` if none are set up. */
  isBiometricAuthenticated(): Promise<boolean>;
}

export default requireNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');
