import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const cron = cronJobs();

cron.daily("sendMemoryVerseReminders", {
  hourUTC: 13, // 1pm UTC +8 = 9pm SGT
  minuteUTC: 0,
}, internal.memoryVerses.sendMemoryVerseReminders, {});


export default cron;
