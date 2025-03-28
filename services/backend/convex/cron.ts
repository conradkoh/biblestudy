import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

export const cron = cronJobs();

cron.daily("sendMemoryVerseReminders", {
  hourUTC: 1, // 9am SGT
  minuteUTC: 0,
}, api.scheduledJobs.sendMemoryVerseReminders);
