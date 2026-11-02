import { describe, expect, it } from '@jest/globals';
import { formatAmount, formatDate } from '@/lib/format';

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

describe('formatDate', () => {
  it('formats an ISO date as DD MM YYYY', () => {
    expect(formatDate('2025-03-07T12:00:00Z')).toBe('07 03 2025');
  });
});
