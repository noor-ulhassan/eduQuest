import authReducer, { authLoading, authSuccess, authLogout, authNetworkError, updateUserStats } from '../authSlice';
import { describe, it, expect } from 'vitest';

describe('AuthSlice Redux Reducer', () => {
  const initialState = {
    user: null,
    status: 'idle',
  };

  it('should return the initial state when passed an empty action', () => {
    expect(authReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle authLoading state', () => {
    const nextState = authReducer(initialState, authLoading());
    expect(nextState.status).toEqual('loading');
    expect(nextState.user).toBeNull();
  });

  it('should handle authSuccess state and store the user payload', () => {
    const mockUser = { id: 1, name: 'Test User', xp: 100 };
    const nextState = authReducer(initialState, authSuccess({ user: mockUser }));
    
    expect(nextState.status).toEqual('authenticated');
    expect(nextState.user).toEqual(mockUser);
  });

  it('should handle authLogout and reset state', () => {
    const loggedInState = {
      user: { id: 1, name: 'Test User' },
      status: 'authenticated',
    };
    
    const nextState = authReducer(loggedInState, authLogout());
    expect(nextState.status).toEqual('unauthenticated');
    expect(nextState.user).toBeNull();
  });

  it('should handle authNetworkError', () => {
    const nextState = authReducer(initialState, authNetworkError());
    expect(nextState.status).toEqual('network_error');
  });

  it('should handle updateUserStats and merge new properties', () => {
    const loggedInState = {
      user: { id: 1, name: 'Test User', xp: 100, level: 2 },
      status: 'authenticated',
    };
    
    // Simulate leveling up and getting more XP
    const nextState = authReducer(loggedInState, updateUserStats({ xp: 500, level: 4 }));
    
    expect(nextState.user.xp).toBe(500);
    expect(nextState.user.level).toBe(4);
    // Other properties should remain unchanged
    expect(nextState.user.name).toBe('Test User');
  });
});
