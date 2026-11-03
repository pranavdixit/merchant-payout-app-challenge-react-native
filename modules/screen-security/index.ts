import ScreenSecurityModule from './src/ScreenSecurityModule';

export function getDeviceId(): string {
  return ScreenSecurityModule.getDeviceId();
}
