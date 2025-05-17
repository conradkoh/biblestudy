import type { Doc } from "@backend/convex/_generated/dataModel";
import { isDefined } from "@common/utils/typecheck";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_MEMORY_VERSES_KEY = 'CACHE_MEMORY_VERSES'
export function useCachedMemoryVerses(memoryVerses: Doc<"memoryVerses">[] | undefined) {

  const [memoryVersesCache, setMemoryVersesCache] = useState<Doc<"memoryVerses">[] | undefined>(undefined);

  // load from cache
  useEffect(() => {
    // Load saved state on mount
    const load = async () => {
      try {
        const savedState = await AsyncStorage.getItem(CACHE_MEMORY_VERSES_KEY);
        if (savedState) {
          console.log(savedState);
          const verses = JSON.parse(savedState) as Doc<"memoryVerses">[];

          setMemoryVersesCache(verses);
        }
      } catch (error) {
        console.error("Failed to load memory verse caches", error);
      }
    };

    load();
  }, []);


  // save to cache
  useEffect(() => {
    if (isDefined(memoryVerses)) {
      AsyncStorage.setItem(CACHE_MEMORY_VERSES_KEY, JSON.stringify(memoryVerses));
      // TODO: validate for forward compatability purposes?
    }
  }, [memoryVerses]);

  if (!isDefined(memoryVerses) && isDefined(memoryVersesCache)) {
    return memoryVersesCache;
  }

  return memoryVerses; // passthrough
}
