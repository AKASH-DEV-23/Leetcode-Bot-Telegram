import User from "../../database/models/user.model.js";

export default function contestReminderCommand(bot) {

    // COMMAND
    bot.command("contest_reminder", async (ctx) => {
        try {

            const user = await User.findOne({ chatId: ctx.chat.id });

            const currentSetting = user?.contestReminder?.enabled
                ? `\n\nCurrent: ${user.contestReminder.hoursBefore} hour(s) before`
                : "\n\nCurrent: Disabled";

            const buttons = [];
            let row = [];

            for (let i = 1; i <= 12; i++) {
                row.push({
                    text: `${i}h`,
                    callback_data: `SET_REMINDER_${i}`
                });

                if (row.length === 4) {
                    buttons.push(row);
                    row = [];
                }
            }

            if (row.length > 0) buttons.push(row);

            buttons.push([
                {
                    text: "❌ Disable",
                    callback_data: "DISABLE_REMINDER"
                }
            ]);

            await ctx.reply(
                `⏰ Select reminder time before contest:${currentSetting}`,
                {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                }
            );

        } catch (err) {
            console.error("Reminder command error:", err);
            await ctx.reply("⚠️ Something went wrong. Try again.");
        }
    });


    // SET REMINDER
    bot.callbackQuery(/SET_REMINDER_(\d+)/, async (ctx) => {
        try {

            const hours = Number(ctx.match[1]);

            await User.updateOne(
                { chatId: ctx.chat.id },
                {
                    $set: {
                        "contestReminder.enabled": true,
                        "contestReminder.hoursBefore": hours
                    }
                },
                { upsert: true } // important
            );

            await ctx.answerCallbackQuery("Reminder updated!");
            await ctx.editMessageText(
                `✅ Reminder set ${hours} hour${hours > 1 ? "s" : ""} before contest.`
            );

        } catch (err) {
            console.error("Set reminder error:", err);
            await ctx.answerCallbackQuery("Error occurred", { show_alert: true });
        }
    });


    // DISABLE
    // DISABLE
    bot.callbackQuery("DISABLE_REMINDER", async (ctx) => {
        try {

            await User.updateOne(
                { chatId: ctx.chat.id },
                {
                    $set: { "contestReminder.enabled": false }
                }
            );

            await ctx.answerCallbackQuery({
                text: "Reminder disabled"
            });

            await ctx.editMessageText("❌ Contest reminder disabled.");

        } catch (err) {
            console.error("Disable reminder error:", err);

            await ctx.answerCallbackQuery({
                text: "Error occurred",
                show_alert: true
            });
        }
    });
}
