import { type OptionalRestArgsOrSkip, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isDefined } from "@common/utils/typecheck";
import type { FunctionReference } from "convex/server";

export interface PersistedQueryOptions<T> {
  /** The storage key for this query's cache */
  storageKey: string;
}

/**
 * A generic hook that provides offline caching for Convex queries.
 * 
 * This hook automatically caches query results in AsyncStorage and provides
 * offline access to previously fetched data. It includes data validation
 * and transformation capabilities for handling API changes.
 * 
 * @param queryRef - The Convex query function reference
 * @param args - The arguments to pass to the query
 * @param options - Configuration options for caching
 * @returns The query result, with cached data as fallback when offline
 */
export function usePersistedQuery<Query extends FunctionReference<"query">, ReturnType extends Query["_returnType"]>(
  queryRef: Query,
  args: OptionalRestArgsOrSkip<Query>,
  options: PersistedQueryOptions<ReturnType>
): ReturnType | undefined {
  const { storageKey } = options;

  const [cachedData, setCachedData] = useState<{ key: string, value: ReturnType } | undefined>(undefined);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Load from cache on mount
  useEffect(() => {

    const loadFromCache = async () => {
      try {
        const savedState = await AsyncStorage.getItem(storageKey);
        if (savedState) {
          let parsedData: ReturnType;

          try {
            parsedData = JSON.parse(savedState) as ReturnType;
          } catch (parseError) {
            console.error(`Failed to parse cached data for ${storageKey}:`, parseError);
            setIsLoadingCache(false);
            return;
          }

          setCachedData({ key: storageKey, value: parsedData });
        }
      } catch (error) {
        console.error(`Failed to load cached data for ${storageKey}:`, error);
      } finally {
        setIsLoadingCache(false);
      }
    };

    loadFromCache();
  }, [storageKey]);

  // Execute the actual query
  const queryResult = useQuery(queryRef, ...args);

  // Save to cache when new data arrives
  useEffect(() => {
    if (!isDefined(queryResult)) {
      return;
    }

    const saveToCache = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(queryResult));
      } catch (error) {
        console.error(`Failed to save cached data for ${storageKey}:`, error);
      }
    };

    saveToCache();
  }, [queryResult, storageKey]);

  // Return cached data if query is loading and we have cached data
  if (!isDefined(queryResult) && cachedData?.key === storageKey && !isLoadingCache) {
    return cachedData.value;
  }

  // Return the actual query result (or undefined if loading)
  return queryResult;
} 
