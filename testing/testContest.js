import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/database/connect.js";

import { updateLeetCodeContests } from "../src/services/leetcode.service.js";
import { updateCodeforcesContests } from "../src/services/codeforces.service.js";
import Contest from "../src/database/models/contest.model.js";

dotenv.config();

async function runTest() {
    try {
        console.log("🔌 Connecting to DB...");
        await connectDB();
        console.log("✅ MongoDB connected");

        console.log("\n🔄 Updating LeetCode...");
        await updateLeetCodeContests();

        console.log("\n🔄 Updating Codeforces...");
        await updateCodeforcesContests();

        console.log("\n📦 Fetching stored contests...");

        const contests = await Contest.find().sort({ startTime: 1 });

        for (const c of contests) {
            console.log(
                `${c.platform.toUpperCase()} | ${c.title} | ${c.startTime.toISOString()}`
            );
        }

        console.log("\n🎉 Test completed successfully");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 MongoDB disconnected");
        process.exit();
    }
}

runTest();
