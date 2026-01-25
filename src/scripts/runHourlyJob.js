import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../database/connect.js";
import { sendDailyLeetCode } from "../scheduler/sendDailyLeetcode.js";

try {
    await connectDB();
    await sendDailyLeetCode();
} catch (err) {
    console.error("❌ Daily job failed:", err);
    process.exit(1);
} finally {
    await mongoose.disconnect();
    console.log("🔌 DB disconnected");
    process.exit(0);
}
