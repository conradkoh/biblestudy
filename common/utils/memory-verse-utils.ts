import { startOfDay, isBefore, isEqual, differenceInDays, addDays, endOfDay } from "date-fns";

export interface MemoryEntry {
  createdAt: number;
}

export interface ExpirationInfo {
  currentStreak: number;
  daysUntilExpiration: number;
  isExpired: boolean;
}

/**
 * Get the number of days until expiration based on current streak
 * @param streak Current streak count
 * @returns Number of days until expiration
 */
export function getExpirationDurationDays(streak: number): number {
  // Streak 0 = 1 day, Streak 1 = 1 day, Streak 2 = 2 days, Streak 3 = 3 days, etc.
  return Math.max(1, streak);
}

/**
 * Calculate when a verse expires based on streak and last recited date
 * @param streak Current streak count
 * @param lastRecitedAt Timestamp of last recitation
 * @returns Timestamp when the verse expires
 */
export function getExpirationDate(streak: number, lastRecitedAt: number): number {
  const expirationDurationDays = getExpirationDurationDays(streak);
  const lastRecitedDate = new Date(lastRecitedAt);
  const expirationDate = addDays(endOfDay(lastRecitedDate), expirationDurationDays);
  return expirationDate.getTime();
}

/**
 * Calculate days until expiration from a given reference date
 * @param streak Current streak count
 * @param lastRecitedAt Timestamp of last recitation
 * @param referenceDate Reference date to calculate from
 * @returns Number of days until expiration (negative if expired)
 */
export function getDaysUntilExpiration(
  streak: number,
  lastRecitedAt: number,
  referenceDate: Date = new Date()
): number {
  const expirationDate = getExpirationDate(streak, lastRecitedAt);
  const referenceTime = referenceDate.getTime();
  const daysDiff = (expirationDate - endOfDay(referenceTime).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(-1, daysDiff); // -1 is expired, 0 is expiring today
}

/**
 * Calculate streak from memory entries
 * A streak is maintained when a user recites a verse before it expires
 * @param entries Array of memory entries
 * @param referenceDate Optional reference date (defaults to current date)
 * @returns Current streak count
 */
export function calculateStreakFromEntries(
  entries: MemoryEntry[],
  referenceDate: Date = new Date()
): number {
  if (entries.length === 0) return 0;

  const validEntries = entries.filter(e =>
    isBefore(new Date(e.createdAt), referenceDate) ||
    isEqual(new Date(e.createdAt), referenceDate)
  );
  if (validEntries.length === 0) return 0;

  const sortedEntries = [...validEntries].sort((a, b) => a.createdAt - b.createdAt);

  let streak = 0;
  let prevEntryDate = new Date(sortedEntries[0]!.createdAt);
  let expirationDate: number | null = null;

  for (let i = 1; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i]!.createdAt);
    expirationDate = getExpirationDate(streak, prevEntryDate.getTime());
    if (entryDate.getTime() <= expirationDate) {
      if (streak === 0) {
        streak = 2
      } else {
        streak += 1;
      }
    } else {
      // streak broken
      streak = 0;
      expirationDate = null;
    }

    prevEntryDate = entryDate;
  }

  if (prevEntryDate) {
    const currentExpirationDate = getExpirationDate(streak, prevEntryDate.getTime());
    if (referenceDate.getTime() >= currentExpirationDate) {
      return 0;
    }
  }
  return streak;
}

/**
 * Calculate comprehensive expiration information from memory entries
 * @param entries Array of memory entries
 * @param referenceDate Reference date for calculations (defaults to current date)
 * @returns Expiration information
 */
export function calculateExpirationInfo(
  entries: MemoryEntry[],
  referenceDate: Date = new Date()
): ExpirationInfo {
  const streak = calculateStreakFromEntries(entries, referenceDate);

  if (entries.length === 0) {
    return {
      currentStreak: 0,
      daysUntilExpiration: 0,
      isExpired: true,
    };
  }

  if (streak === 0) {
    const lastEntry = Math.max(...entries.map(e => e.createdAt));
    const daysUntilExpiration = getDaysUntilExpiration(0, lastEntry, referenceDate);
    return {
      currentStreak: 0,
      daysUntilExpiration,
      isExpired: daysUntilExpiration === -1, // 0 still counts as not expired, as it expires only after the end of day
    };
  }

  const lastRecitedAt = Math.max(...entries.map(e => e.createdAt));
  const daysUntilExpiration = getDaysUntilExpiration(streak, lastRecitedAt, referenceDate);
  return {
    currentStreak: streak,
    daysUntilExpiration,
    isExpired: daysUntilExpiration === -1, // 0 still counts as not expired, as it expires only after the end of day
  };
}

/**
 * Get expiration status for UI display
 * @param daysUntilExpiration Number of days until expiration
 * @returns Status object with color and icon information
 */
export function getExpirationStatus(daysUntilExpiration: number, numOfEntries: number) {
  if (daysUntilExpiration <= 0) {

    if (numOfEntries === 0) {
      return {
        status: 'unattempted' as const,
        color: '#6b7280',
        icon: 'play-circle-outline' as const,
      };
    }

    return {
      status: 'expired' as const,
      color: '#ef4444',
      icon: 'alert-circle' as const,
    };
  }
  else if (daysUntilExpiration <= 3) {
    return {
      status: 'warning' as const,
      color: '#f59e0b',
      icon: 'warning' as const,
    };
  } else {
    return {
      status: 'safe' as const,
      color: '#10b981',
      icon: 'checkmark-circle' as const,
    };
  }
} 
