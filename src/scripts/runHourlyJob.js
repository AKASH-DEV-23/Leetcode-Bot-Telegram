import "dotenv/config";
import { sendDailyLeetCode } from "../scheduler/sendDailyLeetcode.js";

await sendDailyLeetCode();
process.exit(0);
