import "dotenv/config";
import express from "express";
import User from "../database/models/user.model.js";
import { connectDB } from "../database/connect.js";
import { bot } from "./botInstance.js";

// command handlers
import dailyCommand from "./commands/daily.js";
import subscribeCommand from "./commands/subscribe.js";
import unsubscribeCommand from "./commands/unsubscribe.js";
import { sendDailyLeetCode } from "../scheduler/sendDailyLeetcode.js";


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

const PORT = process.env.PORT || 3000;

(async () => {
    await connectDB();
    console.log("🗄️ bot is initializing");
    await bot.init();
    console.log("🤖 Bot initialized");

    await bot.api.setMyCommands([
        { command: "daily", description: "Today's POTD" },
        { command: "subscribe", description: "Get daily question at a fixed time" },
        { command: "unsubscribe", description: "Stop daily questions" },
    ]);

    await sendDailyLeetCode();

    app.listen(PORT, () =>
        console.log(`🚀 Server running on port ${PORT}`)
    );
})();
