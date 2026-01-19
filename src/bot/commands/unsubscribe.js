import User from "../../database/models/user.model.js";

export default function unsubscribeCommand(bot) {
    bot.command("unsubscribe", async (ctx) => {
        if (!ctx.chat?.id) return;

        await User.updateOne(
            { chatId: ctx.chat.id },
            { $set: { isSubscribed: false } },
            { upsert: true }
        );

        await ctx.reply("❌ You have been unsubscribed from daily questions.");
    });
}
