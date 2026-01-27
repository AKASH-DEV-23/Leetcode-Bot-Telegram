import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../database/connect.js";
import { sendDailyLeetCode } from "../scheduler/sendDailyLeetcode.js";
import { sendContestReminder } from "../scheduler/sendContestReminder.js";

try {
    await connectDB();
    await sendDailyLeetCode();
    await sendContestReminder();
} catch (err) {
    console.error("❌ Daily job failed:", err);
    process.exit(1);
} finally {
    await mongoose.disconnect();
    console.log("🔌 DB disconnected");
    process.exit(0);
}
