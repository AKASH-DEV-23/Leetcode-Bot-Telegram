import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/database/connect.js";
import { updateAllContests } from "../src/services/updateAllContests.service.js";

try {

    await connectDB();
    await updateAllContests();

} catch (err) {
    console.error("❌ Contest update failed:", err);
    process.exit(1);
} finally {
    await mongoose.disconnect();
    console.log("🔌 DB disconnected");
    process.exit(0);
}
