import {
  maskIban,
  normalizeIban,
  payoutSchema,
  requiresBiometrics,
  toMinorUnits,
} from '@/lib/payout';

const VALID_IBAN = 'GB29NWBK60161331926819';
const INVALID_IBAN = 'FR1212345123451234567A12310131231231231';

describe('toMinorUnits', () => {
  it.each([
    ['400', 40000],
    ['999.99', 99999],
    ['888.88', 88888],
    ['0.5', 50],
    ['0.05', 5],
    ['1000.00', 100000],
  ])('converts %s to %d', (input, expected) => {
    expect(toMinorUnits(input)).toBe(expected);
  });
});

describe('normalizeIban', () => {
  it('removes spaces and upper-cases', () => {
    expect(normalizeIban('gb29 nwbk 6016 1331 9268 19')).toBe(VALID_IBAN);
  });
});

describe('maskIban', () => {
  it('keeps the first four and last four characters', () => {
    expect(maskIban(VALID_IBAN)).toBe('GB29**************6819');
  });

  it('leaves short values alone', () => {
    expect(maskIban('GB29')).toBe('GB29');
  });
});

describe('payoutSchema', () => {
  const parse = (values: Partial<Record<'amount' | 'currency' | 'iban', string>>) =>
    payoutSchema.safeParse({ amount: '10', currency: 'GBP', iban: VALID_IBAN, ...values });

  it('accepts a valid payout', () => {
    expect(parse({}).success).toBe(true);
  });

  it('accepts an IBAN with spaces and lower case', () => {
    expect(parse({ iban: 'gb29 nwbk 6016 1331 9268 19' }).success).toBe(true);
  });

  it.each(['', '0', '0.00', '-5', 'abc', '1.234'])('rejects the amount "%s"', (amount) => {
    expect(parse({ amount }).success).toBe(false);
  });

  it('rejects an invalid IBAN', () => {
    expect(parse({ iban: INVALID_IBAN }).success).toBe(false);
  });

  it('rejects an empty IBAN', () => {
    expect(parse({ iban: '' }).success).toBe(false);
  });

  it('rejects an unsupported currency', () => {
    expect(parse({ currency: 'USD' }).success).toBe(false);
  });
});

describe('requiresBiometrics', () => {
  it('only applies above 1,000.00', () => {
    expect(requiresBiometrics(100000)).toBe(false);
    expect(requiresBiometrics(100001)).toBe(true);
  });
});
