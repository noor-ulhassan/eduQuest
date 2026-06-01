import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../utils/test-utils';
import BadgesCard from '../BadgesCard';
import { describe, it, expect } from 'vitest';

describe('BadgesCard Component', () => {
  it('renders the correct number of earned badges and mystery badges', () => {
    // 1. Arrange: Setup the initial state with mock badges
    const mockState = {
      auth: {
        user: {
          badges: [
            { _id: '1', title: 'First Steps', rarity: 'Common', icon: 'http://example.com/icon1.png' },
            { _id: '2', title: 'Top Scorer', rarity: 'Epic', icon: 'http://example.com/icon2.png' }
          ]
        }
      }
    };

    // 2. Act: Render the component with the mocked state
    renderWithProviders(<BadgesCard />, { preloadedState: mockState });

    // 3. Assert: Check if the text reflects the mock state
    expect(screen.getByText('2 Badges')).toBeInTheDocument();
    
    // Check if the specific badges rendered
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Top Scorer')).toBeInTheDocument();

    // Check if the remaining 2 slots are Mystery Badges
    const mysteryBadges = screen.getAllByText('Mystery Badge');
    expect(mysteryBadges).toHaveLength(2);
  });

  it('renders correctly for a user with no badges', () => {
    const mockState = {
      auth: {
        user: {
          badges: []
        }
      }
    };

    renderWithProviders(<BadgesCard />, { preloadedState: mockState });

    expect(screen.getByText('0 Badges')).toBeInTheDocument();
    
    const mysteryBadges = screen.getAllByText('Mystery Badge');
    expect(mysteryBadges).toHaveLength(4);
  });
});
