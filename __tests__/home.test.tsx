import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import HomeScreen from '@/app/(tabs)/index';
import { API_BASE_URL } from '@/constants';
import type { ActivityItem, MerchantDataResponse } from '@/types/api';
import { server } from '../mocks/server.test';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));

const activity: ActivityItem[] = [1, 2, 3, 4].map((n) => ({
  id: `a${n}`,
  type: 'deposit',
  amount: n * 1000,
  currency: 'GBP',
  date: '2025-01-01T10:00:00Z',
  description: `Item ${n}`,
  status: 'completed',
}));

const merchant: MerchantDataResponse = {
  available_balance: 500000,
  pending_balance: 12345,
  currency: 'GBP',
  activity,
};

const useMerchantResponse = (response: Response) =>
  server.use(http.get(`${API_BASE_URL}/api/merchant`, () => response));

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('shows a loading indicator first', () => {
    useMerchantResponse(HttpResponse.json(merchant));
    renderHome();
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('shows available and pending balances with the currency symbol', async () => {
    useMerchantResponse(HttpResponse.json(merchant));
    renderHome();
    expect(await screen.findByText('£5,000.00')).toBeTruthy();
    expect(screen.getByText('£123.45')).toBeTruthy();
  });

  it('shows only the 3 most recent activity items', async () => {
    useMerchantResponse(HttpResponse.json(merchant));
    renderHome();
    expect(await screen.findByText('Item 3')).toBeTruthy();
    expect(screen.queryByText('Item 4')).toBeNull();
  });

  it('opens the modal from "Show more"', async () => {
    useMerchantResponse(HttpResponse.json(merchant));
    renderHome();
    fireEvent.press(await screen.findByText('Show more'));
    expect(mockPush).toHaveBeenCalledWith('/modal');
  });

  it('shows an error state and recovers on retry', async () => {
    useMerchantResponse(HttpResponse.json({ error: 'boom' }, { status: 500 }));
    renderHome();
    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();

    useMerchantResponse(HttpResponse.json(merchant));
    fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('£5,000.00')).toBeTruthy();
  });
});
