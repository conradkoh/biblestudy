import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const cron = cronJobs();

cron.daily("sendMemoryVerseReminders", {
  hourUTC: 1, // 9am SGT
  minuteUTC: 0,
}, internal.memoryVerses.sendMemoryVerseReminders, {});


export default cron;
