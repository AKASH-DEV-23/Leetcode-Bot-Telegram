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
import communityCommand from "./commands/community.js";
import contestCommand from "./commands/contest.js";

const userCooldown = new Map();
const warnedUsers = new Set();
const COOLDOWN_TIME = 2000;


if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN missing");
    process.exit(1);
}

/* ----------------------------------
   RATE LIMIT MIDDLEWARE
----------------------------------- */
bot.use(async (ctx, next) => {
    // Only rate limit text messages
    if (!ctx.message?.text) return next();

    const userId = ctx.from?.id;
    if (!userId) return next();

    const now = Date.now();
    const lastRequest = userCooldown.get(userId) || 0;

    if (now - lastRequest < COOLDOWN_TIME) {
        if (!warnedUsers.has(userId)) {
            warnedUsers.add(userId);
            await ctx.reply("⏳ Please slow down. Wait 2 seconds.");

            setTimeout(() => warnedUsers.delete(userId), COOLDOWN_TIME);
        }
        return;
    }

    userCooldown.set(userId, now);

    setTimeout(() => {
        userCooldown.delete(userId);
    }, COOLDOWN_TIME);

    warnedUsers.delete(userId);

    await next();
});



/* ----------------------------------
   GLOBAL MIDDLEWARE
----------------------------------- */
bot.use(async (ctx, next) => {
    console.log("📩 Update:", ctx.update.update_id);

    if (ctx.chat?.id && ctx.message?.text) {
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
communityCommand(bot);


/* ----------------------------------
   FALLBACK FOR UNKNOWN MESSAGES
----------------------------------- */
bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;

    const validCommands = [
        "/daily",
        "/subscribe",
        "/unsubscribe",
        "/contest",
        "/community"
    ];

    if (validCommands.some(cmd => text.startsWith(cmd))) {
        return;
    }

    return ctx.reply(
        `🤔 I didn't understand that.\n\n` +
        `Here’s what you can do:\n\n` +
        `📌 /daily – Today's problem\n` +
        `📅 /contest – Contest schedule\n` +
        `🚀 /subscribe – Get daily question\n` +
        `🚀 /unsubscribe – Stop daily questions\n` +
        `💬 /community – Join discussion group\n\n` +
        `Need help? Join our community below 👇`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔥 Join Community",
                            url: "https://t.me/leetcode_bot_discussion"
                        }
                    ]
                ]
            }
        }
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

    await bot.api.setMyCommands([
        { command: "daily", description: "Today's problem" },
        { command: "subscribe", description: "Enable daily problem" },
        { command: "unsubscribe", description: "Disable daily problem" },
        { command: "contest", description: "Contest schedule" },
        { command: "community", description: "Join discussion group" },
    ]);


    app.listen(PORT, () =>
        console.log(`🚀 Server running on port http://localhost:${PORT}`)
    );
})();
