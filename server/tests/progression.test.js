import { getXPForLevel, getLevelFromXP, calculateRank } from '../utils/progression.js';
import { jest } from '@jest/globals';

describe('XP Calculation & Progression Service', () => {
  
  describe('getXPForLevel', () => {
    it('should return 0 XP for level 1 or below', () => {
      expect(getXPForLevel(1)).toBe(0);
      expect(getXPForLevel(0)).toBe(0);
      expect(getXPForLevel(-5)).toBe(0);
    });

    it('should correctly calculate XP for higher levels', () => {
      // Level 2: 25 * (1) * (4) = 100
      expect(getXPForLevel(2)).toBe(100);
      // Level 5: 25 * (4) * (7) = 700
      expect(getXPForLevel(5)).toBe(700);
    });
  });

  describe('getLevelFromXP', () => {
    it('should return level 1 for 0 or negative XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
      expect(getLevelFromXP(-100)).toBe(1);
    });

    it('should correctly calculate level based on XP', () => {
      // 100 XP -> Level 2
      expect(getLevelFromXP(100)).toBe(2);
      // 700 XP -> Level 5
      expect(getLevelFromXP(700)).toBe(5);
      // 2700 XP -> Level 10
      expect(getLevelFromXP(2700)).toBe(10);
    });
  });

  describe('calculateRank', () => {
    it('should assign Bronze rank for beginners', () => {
      expect(calculateRank(0)).toBe('Bronze');
      expect(calculateRank(699)).toBe('Bronze');
    });

    it('should assign correct ranks based on thresholds', () => {
      expect(calculateRank(700)).toBe('Silver');
      expect(calculateRank(2700)).toBe('Gold');
      expect(calculateRank(16200)).toBe('Platinum');
      expect(calculateRank(252450)).toBe('Grandmaster');
    });
  });
});
