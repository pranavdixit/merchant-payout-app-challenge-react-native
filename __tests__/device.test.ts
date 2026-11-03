import { getDeviceId } from '@/modules/screen-security';
import { getPayoutDeviceId } from '@/lib/device';

const mockedGetDeviceId = jest.mocked(getDeviceId);

describe('getPayoutDeviceId', () => {
  it('returns the native device id', () => {
    expect(getPayoutDeviceId()).toBe('test-device-id');
  });

  it('is undefined when the platform withholds an id', () => {
    mockedGetDeviceId.mockReturnValueOnce('');
    expect(getPayoutDeviceId()).toBeUndefined();
  });

  it('is undefined when the native call throws', () => {
    mockedGetDeviceId.mockImplementationOnce(() => {
      throw new Error('unavailable');
    });
    expect(getPayoutDeviceId()).toBeUndefined();
  });
});
