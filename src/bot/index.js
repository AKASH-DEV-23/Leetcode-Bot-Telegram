import "dotenv/config";
import express from "express";
import User from "../database/models/user.model.js";
import { connectDB } from "../database/connect.js";
import { bot } from "./botInstance.js";
import mongoose from "mongoose";



// command handlers
import dailyCommand from "./commands/daily.js";
import subscribeCommand from "./commands/subscribe.js";
import unsubscribeCommand from "./commands/unsubscribe.js";

import contestCommand from "./commands/contest.js";
import { updateAllContests } from "../services/updateAllContests.service.js";



if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN missing");
    process.exit(1);
}

/* ----------------------------------
   GLOBAL MIDDLEWARE
----------------------------------- */
bot.use(async (ctx, next) => {
    console.log("📩 Update:", ctx.update.update_id);

    if (ctx.chat?.id) {
        await User.updateOne(
            { chatId: ctx.chat.id },
            {
                $set: { lastSeen: new Date() },
                $setOnInsert: { chatId: ctx.chat.id },
            },
            { upsert: true }
        );
    }

    await next();
});

/* ----------------------------------
   ERROR HANDLER
----------------------------------- */
bot.catch(err => {
    console.error("❌ Bot error:", err.error || err);
});

/* ----------------------------------
   REGISTER COMMANDS
----------------------------------- */
dailyCommand(bot);
subscribeCommand(bot);
unsubscribeCommand(bot);
contestCommand(bot);


/* ----------------------------------
   FALLBACK FOR UNKNOWN MESSAGES
----------------------------------- */
bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;

    // Ignore valid commands (already handled)
    if (text.startsWith("/")) return;


    return ctx.reply(
        `❓ Unknown command.\n\n` +
        `✅ Available commands:\n` +
        `/daily – Today's question\n` +
        `/subscribe – Get daily question\n` +
        `/unsubscribe – Stop daily questions\n` +
        `/contest – View contest schedule`
    );
});


/* ----------------------------------
   WEBHOOK SERVER
----------------------------------- */
const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
    res.sendStatus(200);
    bot.handleUpdate(req.body).catch(console.error);
});

app.get("/", (_, res) => {
    res.send("LeetCode Bot is running 🚀");
});

app.get("/health", (_, res) => {
    const dbStatus =
        mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(200).json({
        status: "ok",
        db: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});


const PORT = process.env.PORT || 3000;

(async () => {
    await connectDB();
    await bot.init();
    console.log("🤖 Bot initialized");

    await updateAllContests();

    await bot.api.setMyCommands([
        { command: "daily", description: "Today's problem" },
        { command: "subscribe", description: "Enable daily problem" },
        { command: "unsubscribe", description: "Disable daily problem" },
        { command: "contest", description: "Contest schedule" },
    ]);


    app.listen(PORT, () =>
        console.log(`🚀 Server running on port http://localhost:${PORT}`)
    );
})();
