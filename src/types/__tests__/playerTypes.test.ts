import { createInitialStatistics, PLAYER_COLORS } from '../playerTypes';

describe('playerTypes', () => {
  describe('createInitialStatistics', () => {
    it('creates statistics with all values initialized to 0', () => {
      const stats = createInitialStatistics();
      
      // Check all statistics fields
      Object.values(stats).forEach(value => {
        expect(value).toBe(0);
      });
      
      // Check specific fields
      expect(stats.rollCount).toBe(0);
      expect(stats.totalPips).toBe(0);
      expect(stats.resourcesGained).toBe(0);
      expect(stats.knightsPlayed).toBe(0);
    });

    it('creates a new object each time', () => {
      const stats1 = createInitialStatistics();
      const stats2 = createInitialStatistics();
      
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('PLAYER_COLORS', () => {
    it('has all required colors', () => {
      const requiredColors = ['red', 'blue', 'green', 'orange', 'white', 'brown'];
      
      requiredColors.forEach(color => {
        expect(PLAYER_COLORS).toHaveProperty(color);
      });
    });

    it('has consistent style properties for each color', () => {
      Object.values(PLAYER_COLORS).forEach(colorStyles => {
        expect(colorStyles).toHaveProperty('bg');
        expect(colorStyles).toHaveProperty('text');
        expect(colorStyles).toHaveProperty('border');
        expect(colorStyles).toHaveProperty('hover');
      });
    });

    it('uses correct Tailwind classes', () => {
      // Test a few specific colors
      expect(PLAYER_COLORS.red.bg).toContain('bg-red');
      expect(PLAYER_COLORS.blue.text).toContain('text-blue');
      expect(PLAYER_COLORS.green.border).toContain('border-green');
    });
  });
});
