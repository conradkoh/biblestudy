/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bible from "../bible.js";
import type * as http from "../http.js";
import type * as models_bible_bible_chapters from "../models/bible/bible_chapters.js";
import type * as models_bible_bible_verses from "../models/bible/bible_verses.js";
import type * as models_user_user_notification_tokens from "../models/user/user_notification_tokens.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as system from "../system.js";
import type * as telegram from "../telegram.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bible: typeof bible;
  http: typeof http;
  "models/bible/bible_chapters": typeof models_bible_bible_chapters;
  "models/bible/bible_verses": typeof models_bible_bible_verses;
  "models/user/user_notification_tokens": typeof models_user_user_notification_tokens;
  pushNotifications: typeof pushNotifications;
  system: typeof system;
  telegram: typeof telegram;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
