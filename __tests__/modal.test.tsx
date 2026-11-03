import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import ModalScreen from '@/app/modal';
import { API_BASE_URL } from '@/constants';
import type { ActivityItem, PaginatedActivityResponse } from '@/types/api';
import { server } from '../mocks/server.test';

const makeItem = (n: number): ActivityItem => ({
  id: `a${n}`,
  type: 'payout',
  amount: n * 1000,
  currency: 'GBP',
  date: '2025-03-07T12:00:00Z',
  description: `Item ${n}`,
  status: 'completed',
});

const page1: PaginatedActivityResponse = {
  items: [makeItem(1), makeItem(2)],
  next_cursor: 'a2',
  has_more: true,
};
const page2: PaginatedActivityResponse = {
  items: [makeItem(3)],
  next_cursor: null,
  has_more: false,
};

const requestedCursors: (string | null)[] = [];

function mockActivity(respond: (cursor: string | null) => Response) {
  server.use(
    http.get(`${API_BASE_URL}/api/merchant/activity`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      requestedCursors.push(cursor);
      return respond(cursor);
    }),
  );
}

function renderModal() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <ModalScreen />
    </QueryClientProvider>,
  );
}

const scrollToEnd = () => fireEvent(screen.getByTestId('activity-list'), 'endReached');

describe('ModalScreen', () => {
  beforeEach(() => {
    requestedCursors.length = 0;
  });

  it('shows a loading indicator first', () => {
    mockActivity(() => HttpResponse.json(page1));
    renderModal();
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('shows description, type, date and amount for each item', async () => {
    mockActivity(() => HttpResponse.json(page1));
    renderModal();
    expect(await screen.findByText('Item 1')).toBeTruthy();
    expect(screen.getAllByText('payout - 07 03 2025')).toHaveLength(2);
    expect(screen.getByText('£10.00')).toBeTruthy();
  });

  it('loads the next page with the cursor when scrolled to the end', async () => {
    mockActivity((cursor) => HttpResponse.json(cursor === 'a2' ? page2 : page1));
    renderModal();
    await screen.findByText('Item 2');
    scrollToEnd();
    expect(await screen.findByText('Item 3')).toBeTruthy();
    expect(requestedCursors).toEqual([null, 'a2']);
  });

  it('does not request more once there are no further pages', async () => {
    mockActivity(() => HttpResponse.json(page2));
    renderModal();
    await screen.findByText('Item 3');
    scrollToEnd();
    expect(requestedCursors).toEqual([null]);
  });

  it('shows an error state and recovers on retry', async () => {
    mockActivity(() => HttpResponse.json({ error: 'boom' }, { status: 500 }));
    renderModal();
    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();

    mockActivity(() => HttpResponse.json(page1));
    fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('Item 1')).toBeTruthy();
  });

  it('keeps loaded items and offers a retry when loading more fails', async () => {
    mockActivity((cursor) =>
      cursor ? HttpResponse.json({ error: 'boom' }, { status: 500 }) : HttpResponse.json(page1),
    );
    renderModal();
    await screen.findByText('Item 2');
    scrollToEnd();
    expect(await screen.findByText(/failed to load more/i)).toBeTruthy();
    expect(screen.getByText('Item 1')).toBeTruthy();

    mockActivity(() => HttpResponse.json(page2));
    fireEvent.press(screen.getByText(/failed to load more/i));
    expect(await screen.findByText('Item 3')).toBeTruthy();
  });
});
