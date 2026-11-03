import { requireNativeModule } from 'expo';

/** The native surface of `ScreenSecurity`. Steps 5 and 6 extend this with biometrics and screenshot events. */
interface ScreenSecurityNativeModule {
  /** A unique identifier for this device, or an empty string if the platform withholds one. */
  getDeviceId(): string;
}

export default requireNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');
