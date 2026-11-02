import { describe, expect, it } from '@jest/globals';
import { formatAmount } from '@/lib/format';

describe('formatAmount', () => {
  it('formats GBP minor units with the £ symbol', () => {
    expect(formatAmount(500000, 'GBP')).toBe('£5,000.00');
  });

  it('formats EUR minor units with the € symbol', () => {
    expect(formatAmount(99999, 'EUR')).toBe('€999.99');
  });

  it('keeps fractional amounts', () => {
    expect(formatAmount(5, 'GBP')).toBe('£0.05');
  });

  it('formats negative amounts', () => {
    expect(formatAmount(-1050, 'GBP')).toBe('-£10.50');
  });
});
