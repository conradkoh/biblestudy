import { ConvexProvider, ConvexReactClient } from "convex/react";

if (!process.env.EXPO_PUBLIC_CONVEX_URL)
  throw new Error("EXPO_PUBLIC_CONVEX_URL is not set");
export const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);
