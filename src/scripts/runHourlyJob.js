import "dotenv/config";
import { sendDailyLeetCode } from "../scripts/runHourlyJob.js";

await sendDailyLeetCode();
process.exit(0);
