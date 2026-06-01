import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/test-utils';
import LeaderboardPage from '../LeaderboardPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API calls so we don't hit a real server during tests
vi.mock('../../../features/leaderboard/leaderboardApi', () => ({
  getGlobalLeaderboard: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      data: [
        { _id: '1', name: 'Alice', xp: 5000, league: 'Gold', level: 10 },
        { _id: '2', name: 'Bob', xp: 3000, league: 'Silver', level: 8 },
        { _id: '3', name: 'Charlie', xp: 1000, league: 'Bronze', level: 3 }
      ]
    }
  })),
  getPlaygroundLeaderboard: vi.fn(),
  getCompetitionLeaderboard: vi.fn(),
  getLearnerLeaderboard: vi.fn(),
  getWeeklyLeaderboard: vi.fn(),
}));

describe('LeaderboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the leaderboard heading and tabs', async () => {
    renderWithProviders(<LeaderboardPage />);
    
    expect(screen.getByText('Rankings')).toBeInTheDocument();
    expect(screen.getByText('Global XP')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
  });

  it('fetches and displays the top 3 global users correctly on the podium', async () => {
    renderWithProviders(<LeaderboardPage />, {
      preloadedState: {
        auth: { user: { _id: '99', name: 'Me' } }
      }
    });

    // Wait for the mock API call to resolve and the UI to update
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Verify all 3 top users are rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Verify their XP is displayed (formatted with commas)
    expect(screen.getByText('5,000 XP')).toBeInTheDocument();
    expect(screen.getByText('3,000 XP')).toBeInTheDocument();
    expect(screen.getByText('1,000 XP')).toBeInTheDocument();
  });
});
