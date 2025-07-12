import type { Doc } from "@backend/convex/_generated/dataModel";
import { isSameDay, startOfDay } from "date-fns";
import { calculateExpirationInfo, ExpirationInfo } from "@common/utils/memory-verse-utils";
import type { MemoryVerseSortOption } from "@/src/stores/settings-store";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export function sortMemoryVerses(
  verses: Doc<"memoryVerses">[],
  sortOption: MemoryVerseSortOption
): Doc<"memoryVerses">[] {
  const today = startOfDay(new Date());

  switch (sortOption) {
    case 'default':
      return [...verses].sort((a, b) => {
        const aExpirationInfo = calculateExpirationInfo(a.memoryEntries);
        const bExpirationInfo = calculateExpirationInfo(b.memoryEntries);

        const priorityMap = {
          expiringSoon: 4,
          expired: 3,
          neverRecited: 2,
          recitedToday: 1,
        }
      
        function getPriority(verse: Doc<"memoryVerses">) {
          const expirationInfo = calculateExpirationInfo(verse.memoryEntries);
          if (verse.memoryEntries.length === 0) return priorityMap.neverRecited;
          if (verse.memoryEntries.some(entry => isSameDay(new Date(entry.createdAt), today))) return priorityMap.recitedToday;
          if (expirationInfo.isExpired) return priorityMap.expired;
          // expiring soon (not expired, has entries, but not today)
          // Introduce days till expiration so that among the expiring soon verses, it will sort by how soon it will expire
          return priorityMap.expiringSoon - expirationInfo.daysUntilExpiration / 1000;
        }
        
        return getPriority(b) - getPriority(a);
      });

    case 'date_increasing':
      return [...verses].sort((a, b) => {
        const aDate = new Date(a._creationTime);
        const bDate = new Date(b._creationTime);
        return aDate.getTime() - bDate.getTime();
      });

    case 'date_decreasing':
      return [...verses].sort((a, b) => {
        const aDate = new Date(a._creationTime);
        const bDate = new Date(b._creationTime);
        return bDate.getTime() - aDate.getTime();
      });

    case 'least_memorized':
      return [...verses].sort((a, b) => {
        return a.memoryEntries.length - b.memoryEntries.length;
      });

    default:
      return verses;
  }
} 


export const mapSortToInfo: Record<MemoryVerseSortOption, { id: MemoryVerseSortOption, icon: ComponentProps<typeof Ionicons>['name'], label: string, description: string }> = {
  default: {
    id: 'default',
    icon: 'time-outline',
    label: 'Expiring Soon',
    description: 'Prioritizes verses that need attention: expiring soon, then expired, then unrecited',
  }, 
  date_increasing: {
    id: 'date_increasing',
    icon: 'arrow-down',
    label: 'Oldest Added',
    description: 'Shows verses in the order they were added, oldest first',
  },
  date_decreasing: {
    id: 'date_decreasing',
    icon: 'arrow-down',
    label: 'Recently Added',
    description: 'Shows verses in the order they were added, newest first',
  },
  least_memorized: {
    id: 'least_memorized',
    icon: 'arrow-down',
    label: 'Least Memorized',
    description: 'Shows verses with the fewest memory entries first',
  },
}
