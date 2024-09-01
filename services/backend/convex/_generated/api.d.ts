/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bible from "../bible.js";
import type * as http from "../http.js";
import type * as models_bible_bible_chapters from "../models/bible/bible_chapters.js";
import type * as models_bible_bible_verses from "../models/bible/bible_verses.js";
import type * as system from "../system.js";
import type * as telegram from "../telegram.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bible: typeof bible;
  http: typeof http;
  "models/bible/bible_chapters": typeof models_bible_bible_chapters;
  "models/bible/bible_verses": typeof models_bible_bible_verses;
  system: typeof system;
  telegram: typeof telegram;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
