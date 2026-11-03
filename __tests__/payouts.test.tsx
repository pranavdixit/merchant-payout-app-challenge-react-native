import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import PayoutsScreen from '@/app/(tabs)/payouts';
import { API_BASE_URL } from '@/constants';
import { server } from '../mocks/server.test';

const VALID_IBAN = 'GB29NWBK60161331926819';
const INVALID_IBAN = 'FR1212345123451234567A12310131231231231';

function renderPayouts() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PayoutsScreen />
    </QueryClientProvider>,
  );
}

const confirmButton = (options?: { disabled?: boolean }) =>
  screen.getByRole('button', { name: 'Confirm', ...options });

async function fillForm(amount: string, iban = VALID_IBAN) {
  fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  fireEvent.changeText(screen.getByLabelText('IBAN'), iban);
  await waitFor(() => {
    expect(confirmButton({ disabled: false })).toBeTruthy();
  });
}

/** Fills the form, opens the confirmation dialog and confirms it. */
async function submitPayout(amount: string) {
  await fillForm(amount);
  fireEvent.press(confirmButton());
  const dialog = await screen.findByTestId('confirm-dialog');
  fireEvent.press(within(dialog).getByTestId('confirm-dialog-confirm'));
}

describe('PayoutsScreen form', () => {
  it('shows the empty form with a disabled Confirm button', () => {
    renderPayouts();
    expect(screen.getByText('Send Payout')).toBeTruthy();
    expect(screen.getByPlaceholderText('0.00')).toBeTruthy();
    expect(screen.getByText('GBP')).toBeTruthy();
    expect(screen.getByText('Enter the destination bank account IBAN')).toBeTruthy();
    expect(confirmButton({ disabled: true })).toBeTruthy();
  });

  it('enables Confirm once the amount and IBAN are valid', async () => {
    renderPayouts();
    await fillForm('400');
    expect(confirmButton({ disabled: false })).toBeTruthy();
  });

  it.each([
    ['0', 'Amount must be greater than zero'],
    ['0.00', 'Amount must be greater than zero'],
    ['-5', 'Enter a valid amount'],
  ])('keeps Confirm disabled for the amount "%s"', async (amount, message) => {
    renderPayouts();
    fireEvent.changeText(screen.getByLabelText('Amount'), amount);
    fireEvent.changeText(screen.getByLabelText('IBAN'), VALID_IBAN);
    expect(await screen.findByText(message)).toBeTruthy();
    expect(confirmButton({ disabled: true })).toBeTruthy();
  });

  it('shows an error and keeps Confirm disabled for an invalid IBAN', async () => {
    renderPayouts();
    fireEvent.changeText(screen.getByLabelText('Amount'), '400');
    fireEvent.changeText(screen.getByLabelText('IBAN'), INVALID_IBAN);
    expect(await screen.findByText('Enter a valid IBAN')).toBeTruthy();
    expect(confirmButton({ disabled: true })).toBeTruthy();
  });

  it('accepts a comma as the decimal separator', () => {
    renderPayouts();
    fireEvent.changeText(screen.getByLabelText('Amount'), '400,50');
    expect(screen.getByLabelText('Amount').props.value).toBe('400.50');
  });

  it('lets the merchant switch currency', async () => {
    renderPayouts();
    fireEvent(screen.getByTestId('currency-dropdown'), 'change', { label: 'EUR', value: 'EUR' });
    await fillForm('400');
    fireEvent.press(confirmButton());
    const dialog = await screen.findByTestId('confirm-dialog');
    expect(within(dialog).getByText('€400.00')).toBeTruthy();
    expect(within(dialog).getByText('EUR')).toBeTruthy();
  });
});

describe('confirmation dialog', () => {
  it('summarises the payout with a masked IBAN', async () => {
    renderPayouts();
    await fillForm('400');
    fireEvent.press(confirmButton());

    const dialog = await screen.findByTestId('confirm-dialog');
    expect(within(dialog).getByText('Confirm Payout')).toBeTruthy();
    expect(within(dialog).getByText('£400.00')).toBeTruthy();
    expect(within(dialog).getByText('GBP')).toBeTruthy();
    expect(within(dialog).getByText('GB29**************6819')).toBeTruthy();
  });

  it('returns to the form with its values when cancelled', async () => {
    renderPayouts();
    await fillForm('400');
    fireEvent.press(confirmButton());
    fireEvent.press(within(await screen.findByTestId('confirm-dialog')).getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });
    expect(screen.getByLabelText('Amount').props.value).toBe('400');
  });
});

describe('submitting a payout', () => {
  it('shows the completed state with the amount, then resets for another payout', async () => {
    renderPayouts();
    await submitPayout('400');

    expect(await screen.findByText('Payout Completed')).toBeTruthy();
    expect(
      screen.getByText('Your payout of £400.00 has been processed successfully.'),
    ).toBeTruthy();

    fireEvent.press(screen.getByText('Create Another Payout'));
    expect(await screen.findByText('Send Payout')).toBeTruthy();
    expect(screen.getByLabelText('Amount').props.value).toBe('');
    expect(screen.getByLabelText('IBAN').props.value).toBe('');
  });

  it('sends the amount in minor units with the normalised IBAN', async () => {
    let body: unknown;
    server.use(
      http.post(`${API_BASE_URL}/api/payouts`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          {
            id: 'p1',
            status: 'completed',
            amount: 40050,
            currency: 'GBP',
            iban: VALID_IBAN,
            created_at: '2025-01-01T10:00:00Z',
          },
          { status: 201 },
        );
      }),
    );
    renderPayouts();
    fireEvent.changeText(screen.getByLabelText('Amount'), '400.50');
    fireEvent.changeText(screen.getByLabelText('IBAN'), 'gb29 nwbk 6016 1331 9268 19');
    await waitFor(() => {
      expect(confirmButton({ disabled: false })).toBeTruthy();
    });
    fireEvent.press(confirmButton());
    fireEvent.press(
      within(await screen.findByTestId('confirm-dialog')).getByTestId('confirm-dialog-confirm'),
    );

    await screen.findByText('Payout Completed');
    expect(body).toEqual({ amount: 40050, currency: 'GBP', iban: VALID_IBAN });
  });

  it('shows the service-unavailable failure (503) and keeps the values on Try Again', async () => {
    renderPayouts();
    await submitPayout('999.99');

    expect(await screen.findByText('Unable to Process Payout')).toBeTruthy();
    expect(
      screen.getByText('Service temporarily unavailable. Please try again later.'),
    ).toBeTruthy();

    fireEvent.press(screen.getByText('Try Again'));
    expect(await screen.findByText('Send Payout')).toBeTruthy();
    expect(screen.getByLabelText('Amount').props.value).toBe('999.99');
    expect(screen.getByLabelText('IBAN').props.value).toBe(VALID_IBAN);
  });

  it('shows the insufficient funds failure (400)', async () => {
    renderPayouts();
    await submitPayout('888.88');

    expect(await screen.findByText('Unable to Process Payout')).toBeTruthy();
    expect(screen.getByText('Insufficient funds.')).toBeTruthy();
  });

  it('shows a failure when the payout is accepted but ends as failed', async () => {
    renderPayouts();
    await submitPayout('10.99');

    expect(await screen.findByText('Unable to Process Payout')).toBeTruthy();
    expect(screen.getByText('Your payout could not be completed. Please try again.')).toBeTruthy();
  });

  it('reuses the idempotency key when retrying after an unconfirmed attempt', async () => {
    const keys: (string | null)[] = [];
    server.use(
      http.post(`${API_BASE_URL}/api/payouts`, ({ request }) => {
        keys.push(request.headers.get('Idempotency-Key'));
        return HttpResponse.error();
      }),
    );
    renderPayouts();
    await submitPayout('400');
    fireEvent.press(await screen.findByText('Try Again'));
    await screen.findByText('Send Payout');
    fireEvent.press(confirmButton());
    fireEvent.press(
      within(await screen.findByTestId('confirm-dialog')).getByTestId('confirm-dialog-confirm'),
    );
    await screen.findByText('Unable to Process Payout');

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it('shows a network error message when the request cannot be made', async () => {
    server.use(http.post(`${API_BASE_URL}/api/payouts`, () => HttpResponse.error()));
    renderPayouts();
    await submitPayout('400');

    expect(await screen.findByText('Unable to Process Payout')).toBeTruthy();
    expect(
      screen.getByText(
        "We couldn't confirm whether the payout went through. Check Activity before trying again.",
      ),
    ).toBeTruthy();
  });
});
