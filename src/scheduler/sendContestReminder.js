import User from "../database/models/user.model.js";
import Contest from "../database/models/contest.model.js";
import { bot } from "../bot/botInstance.js";
import ContestReminderLog from "../database/models/contestReminderLog.model.js";

export const sendContestReminder = async () => {
    try {

        const now = new Date();
        const nowTime = now.getTime();

        const users = await User.find(
            { "contestReminder.enabled": true },
            { chatId: 1, "contestReminder.hoursBefore": 1 }
        );


        if (!users.length) {
            console.log("No reminder users found.");
            return;
        }

        const maxWindow = 12 * 60 * 60 * 1000;

        const contests = await Contest.find({
            startTime: {
                $gt: now,
                $lte: new Date(nowTime + maxWindow)
            }
        });

        for (const contest of contests) {

            const contestStartTime = new Date(contest.startTime).getTime();

            for (const user of users) {

                const reminderTime =
                    contestStartTime -
                    user.contestReminder.hoursBefore * 60 * 60 * 1000;

                const windowMs = 60 * 60 * 1000;
                const windowEnd = reminderTime + windowMs;

                if (nowTime >= reminderTime && nowTime < windowEnd) {

                    try {

                        // Try creating reminder log first
                        await ContestReminderLog.create({
                            contestId: contest._id,
                            chatId: user.chatId,
                            hoursBefore: user.contestReminder.hoursBefore
                        });

                        // If create succeeds → send message
                        await bot.api.sendMessage(
                            user.chatId,
                            `⏰ Reminder!\n\n${contest.name} starts in ${user.contestReminder.hoursBefore} hour(s).\n\nGood luck 🚀`
                        );

                        await new Promise(res => setTimeout(res, 30));


                    } catch (error) {

                        // Duplicate key error = already sent
                        if (error.code === 11000) {
                            continue;
                        }

                        // Bot blocked handling
                        if (error?.response?.description?.includes("bot was blocked")) {

                            await User.updateOne(
                                { chatId: user.chatId },
                                { $set: { "contestReminder.enabled": false } }
                            );
                        }

                        console.error("Reminder send error:", error.message);
                    }
                }
            }
        }


        console.log("✅ Contest reminder job completed.");

    } catch (err) {
        console.error("❌ Contest reminder job failed:", err);
    }
};
