import ScreenSecurityModule from './src/ScreenSecurityModule';

export function getDeviceId(): string {
  return ScreenSecurityModule.getDeviceId();
}

/** Prompts for biometrics: `true` when approved, `false` when cancelled or failed. */
export function isBiometricAuthenticated(): Promise<boolean> {
  return ScreenSecurityModule.isBiometricAuthenticated();
}

const NOT_ENROLLED_CODE = 'BIOMETRICS_NOT_ENROLLED';

/** Whether `isBiometricAuthenticated` rejected because the device has no biometrics set up. */
export function isBiometricsNotEnrolledError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === NOT_ENROLLED_CODE
  );
}

/** Calls `listener` whenever the user takes a screenshot; returns an unsubscribe function. */
export function addScreenshotListener(listener: () => void): () => void {
  const subscription = ScreenSecurityModule.addListener('onScreenshotTaken', listener);
  return () => subscription.remove();
}
