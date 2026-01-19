import User from "../../database/models/user.model.js";
import { hourKeyboard } from "../keyboards/hourKeyboard.js";

export default function subscribeCommand(bot) {

    // /subscribe command
    bot.command("subscribe", async (ctx) => {
        await ctx.reply(
            "⏰ Select UTC time to receive the daily question",
            { reply_markup: hourKeyboard() }
        );
    });

    // hour selection callback
    bot.callbackQuery(/^hour_\d+$/, async (ctx) => {
        if (!ctx.chat?.id) return;

        const hour = Number(ctx.callbackQuery.data.split("_")[1]);
        const chatId = ctx.chat.id;
        const formatted = `${String(hour).padStart(2, "0")}:00`;

        // fetch user from MongoDB
        const user = await User.findOne({ chatId });

        // already subscribed at same hour
        if (user && user.isSubscribed && user.hour === hour) {
            await ctx.answerCallbackQuery({
                text: `Already subscribed at ${formatted} UTC`,
                show_alert: false,
            });

            return ctx.reply(`ℹ️ You are already subscribed at 🕒 ${formatted} UTC`);
        }

        // upsert subscription
        await User.updateOne(
            { chatId },
            {
                $set: {
                    isSubscribed: true,
                    hour,
                    updatedAt: new Date(),
                },
                $setOnInsert: { chatId },
            },
            { upsert: true }
        );

        await ctx.answerCallbackQuery();
        await ctx.reply(
            `✅ Subscribed!\n🕒 You'll receive the daily question at ${formatted} UTC`
        );
    });
}
