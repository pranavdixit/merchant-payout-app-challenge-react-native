import { requireNativeModule } from 'expo';

/** The native surface of `ScreenSecurity`. Step 6 extends this with screenshot events. */
interface ScreenSecurityNativeModule {
  /** A unique identifier for this device, or an empty string if the platform withholds one. */
  getDeviceId(): string;
  /** Resolves whether the user passed biometrics; rejects with code `BIOMETRICS_NOT_ENROLLED` if none are set up. */
  isBiometricAuthenticated(): Promise<boolean>;
}

export default requireNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');
