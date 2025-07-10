import {
  calculateStreakFromEntries,
  calculateExpirationInfo,
  getExpirationStatus,
  getExpirationDurationDays,
  type MemoryEntry
} from './memory-verse-utils';

describe('Memory Verse Utils', () => {
  describe('getExpirationDurationDays', () => {
    it('should return 1 day for streak 0', () => {
      expect(getExpirationDurationDays(0)).toBe(1);
    });

    it('should return 1 day for streak 1', () => {
      expect(getExpirationDurationDays(1)).toBe(1);
    });

    it('should return streak number for higher streaks', () => {
      expect(getExpirationDurationDays(2)).toBe(2);
      expect(getExpirationDurationDays(3)).toBe(3);
      expect(getExpirationDurationDays(10)).toBe(10);
    });
  });

  describe('calculateStreakFromEntries', () => {
    it('should return 0 for empty entries', () => {
      const result = calculateStreakFromEntries([]);
      expect(result).toBe(0);
    });

    it('should return 0 for single entry', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const entries: MemoryEntry[] = [
        { createdAt: today.getTime() }
      ];

      const result = calculateStreakFromEntries(entries, today);
      expect(result).toBe(0);
    });

    it('should not count multiple entries on the same day as a streak', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const morning = new Date('2024-01-01T08:00:00Z');
      const evening = new Date('2024-01-01T20:00:00Z');

      const entries: MemoryEntry[] = [
        { createdAt: morning.getTime() },
        { createdAt: evening.getTime() },
      ];

      const result = calculateStreakFromEntries(entries, today);
      expect(result).toBe(0); // Should not count as streak of 2
    });

    it('should demonstrate what actually happens with multiple entries on same day', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const morning = new Date('2024-01-01T08:00:00Z');
      const evening = new Date('2024-01-01T20:00:00Z');

      const entries: MemoryEntry[] = [
        { createdAt: morning.getTime() },
        { createdAt: evening.getTime() },
      ];

      const result = calculateStreakFromEntries(entries, today);
      console.log('Streak result:', result);
      console.log('Entries:', entries);

      // Let's see what the actual behavior is
      expect(result).toBeDefined();
    });

    it('should show what happens when checking streak on a later date', () => {
      const day1 = new Date('2024-01-01T12:00:00Z');
      const morning = new Date('2024-01-01T08:00:00Z');
      const evening = new Date('2024-01-01T20:00:00Z');
      const day2 = new Date('2024-01-02T12:00:00Z');

      const entries: MemoryEntry[] = [
        { createdAt: morning.getTime() },
        { createdAt: evening.getTime() },
      ];

      // Check on day 1
      const resultDay1 = calculateStreakFromEntries(entries, day1);
      console.log('Streak on day 1:', resultDay1);

      // Check on day 2
      const resultDay2 = calculateStreakFromEntries(entries, day2);
      console.log('Streak on day 2:', resultDay2);

      expect(resultDay1).toBeDefined();
      expect(resultDay2).toBeDefined();
    });

    it('should build streak correctly', () => {
      const day1 = new Date('2024-01-01T12:00:00Z');
      const day2 = new Date('2024-01-02T12:00:00Z');
      const day3 = new Date('2024-01-03T12:00:00Z');

      const entries: MemoryEntry[] = [
        { createdAt: day1.getTime() },
        { createdAt: day2.getTime() },
        { createdAt: day3.getTime() },
      ];

      const result = calculateStreakFromEntries(entries, day3);
      expect(result).toBe(3);
    });

    it('should break streak when entry is after expiration', () => {
      const day1 = new Date('2024-01-01T12:00:00Z');
      const day4 = new Date('2024-01-04T12:00:00Z'); // After 2-day expiration window

      const entries: MemoryEntry[] = [
        { createdAt: day1.getTime() },
        { createdAt: day4.getTime() },
      ];

      const result = calculateStreakFromEntries(entries, day4);
      expect(result).toBe(0); // New streak starts
    });

    it('should maintain streak when entry is before expiration', () => {
      const day1 = new Date('2024-01-01T12:00:00Z');
      const day2 = new Date('2024-01-02T12:00:00Z'); // Within 1-day expiration window

      const entries: MemoryEntry[] = [
        { createdAt: day1.getTime() },
        { createdAt: day2.getTime() },
      ];

      const result = calculateStreakFromEntries(entries, day2);
      expect(result).toBe(2);
    });
  });

  describe('calculateExpirationInfo', () => {
    it('should handle new verse with no entries', () => {
      const currentTime = new Date('2024-01-01T12:00:00Z');
      const result = calculateExpirationInfo([], currentTime);

      expect(result.isExpired).toBe(true);
      expect(result.currentStreak).toBe(0);
      expect(result.daysUntilExpiration).toBe(0);
    });

    it('should calculate expiration for active streak', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const entries: MemoryEntry[] = [
        { createdAt: yesterday.getTime() },
        { createdAt: today.getTime() },
      ];

      const result = calculateExpirationInfo(entries, today);

      expect(result.isExpired).toBe(false);
      expect(result.currentStreak).toBe(2);
      expect(result.daysUntilExpiration).toBe(2);
    });

    it('should handle expired verse', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const entries: MemoryEntry[] = [
        { createdAt: threeDaysAgo.getTime() },
      ];

      const result = calculateExpirationInfo(entries, today);

      expect(result.isExpired).toBe(true);
      expect(result.currentStreak).toBe(0);
    });

    it('should handle verse close to expiration', () => {
      const today = new Date('2024-01-01T12:00:00Z');
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const entries: MemoryEntry[] = [
        { createdAt: yesterday.getTime() },
      ];

      const result = calculateExpirationInfo(entries, today);

      expect(result.isExpired).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.daysUntilExpiration).toBe(0); // Expires today
    });
  });

  describe('getExpirationStatus', () => {
    it('should return expired status for negative days', () => {
      const status = getExpirationStatus(-1, 1);
      expect(status.status).toBe('expired');
      expect(status.icon).toBe('alert-circle');
    });

    it('should return expired status for 0 days', () => {
      const status = getExpirationStatus(0, 1);
      expect(status.status).toBe('expired');
      expect(status.icon).toBe('alert-circle');
    });

    it('should return warning status for 1-3 days', () => {
      expect(getExpirationStatus(1, 1).status).toBe('warning');
      expect(getExpirationStatus(2, 1).status).toBe('warning');
      expect(getExpirationStatus(3, 1).status).toBe('warning');

      const status = getExpirationStatus(2, 1);
      expect(status.icon).toBe('warning');
    });

    it('should return safe status for 4+ days', () => {
      expect(getExpirationStatus(4, 1).status).toBe('safe');
      expect(getExpirationStatus(10, 1).status).toBe('safe');
      expect(getExpirationStatus(100, 1).status).toBe('safe');

      const status = getExpirationStatus(5, 1);
      expect(status.icon).toBe('checkmark-circle');
    });
  });

  describe('Real-world scenarios', () => {
    it('should demonstrate the complete flow: new verse -> streak building -> expiration', () => {
      const baseTime = new Date('2024-01-01T12:00:00Z');

      // Day 1: New verse, no streak
      let entries: MemoryEntry[] = [];
      let result = calculateExpirationInfo(entries, baseTime);
      expect(result.isExpired).toBe(true);

      // Day 1: User recites the verse
      entries.push({ createdAt: baseTime.getTime() });
      result = calculateExpirationInfo(entries, baseTime);
      expect(result.currentStreak).toBe(0);
      expect(result.daysUntilExpiration).toBe(1);
      expect(result.isExpired).toBe(false);

      // Day 2: User recites again (streak = 2)
      const day2 = new Date(baseTime);
      day2.setDate(day2.getDate() + 1);
      entries.push({ createdAt: day2.getTime() });
      result = calculateExpirationInfo(entries, day2);
      expect(result.currentStreak).toBe(2);
      expect(result.daysUntilExpiration).toBe(2);
      expect(result.isExpired).toBe(false);

      // Day 3: User doesn't recite (streak doesn't break, because streak 2 means expiration is 2 days)
      const day3 = new Date(baseTime);
      day3.setDate(day3.getDate() + 2);
      result = calculateExpirationInfo(entries, day3);
      expect(result.isExpired).toBe(false);
      expect(result.currentStreak).toBe(2);
      expect(result.daysUntilExpiration).toBe(1);

      // Day 4: User doesn't recite (streak doesn't break, because streak 2 means expiration is 2 days)
      const day4 = new Date(baseTime);
      day4.setDate(day4.getDate() + 3);
      result = calculateExpirationInfo(entries, day4);
      expect(result.currentStreak).toBe(2);
      expect(result.daysUntilExpiration).toBe(0); // expires today
      expect(result.isExpired).toBe(false);

      // Day 5: it expires
      const day5 = new Date(baseTime);
      day5.setDate(day5.getDate() + 4);
      result = calculateExpirationInfo(entries, day5);
      expect(result.isExpired).toBe(true);
      expect(result.currentStreak).toBe(0);
      expect(result.daysUntilExpiration).toBe(-1);

      // Day 5: User recites (streak = 0)
      entries.push({ createdAt: day5.getTime() });
      result = calculateExpirationInfo(entries, day5);
      expect(result.isExpired).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.daysUntilExpiration).toBe(1);
    });

    it('should handle early recitation extending the streak', () => {
      const baseTime = new Date('2024-01-01T12:00:00Z');

      // Day 1: User recites
      let entries: MemoryEntry[] = [
        { createdAt: baseTime.getTime() }
      ];

      // Day 2: User recites (streak = 2)
      const day2 = new Date(baseTime);
      day2.setDate(day2.getDate() + 1);
      entries.push({ createdAt: day2.getTime() });

      // Day 3: User recites early (streak = 3)
      const day3 = new Date(baseTime);
      day3.setDate(day3.getDate() + 2);
      entries.push({ createdAt: day3.getTime() });

      let result = calculateExpirationInfo(entries, day3);
      expect(result.currentStreak).toBe(3);
      expect(result.daysUntilExpiration).toBe(3);

      // Day 4: User recites early again (streak = 4)
      const day4 = new Date(baseTime);
      day4.setDate(day4.getDate() + 3);
      entries.push({ createdAt: day4.getTime() });

      result = calculateExpirationInfo(entries, day4);
      expect(result.currentStreak).toBe(4);
      expect(result.daysUntilExpiration).toBe(4);
    });
  });
}); 
