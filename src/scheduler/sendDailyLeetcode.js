import User from "../database/models/user.model.js";
import { bot } from "../bot/botInstance.js";
import { connectDB } from "../database/connect.js";
import { getDailyProblem } from "../services/leetcodeDaily.service.js";
import {
    cleanText,
    extractImages,
    buildInlineKeyboard,
} from "../utils/formatter.js";
import { buildTelegramMessage } from "../utils/markdown.js";

export const sendDailyLeetCode = async () => {
    try {

        const currentHourUTC = new Date().getUTCHours();

        // 1️⃣ Fetch daily problem ONCE
        const potd = await getDailyProblem();

        const { mainText, constraintsText } = cleanText(
            potd.content,
            potd.constraints
        );

        const message = buildTelegramMessage({
            title: potd.title,
            mainText,
            constraintsText,
        });

        const images = extractImages(potd.content);

        // 2️⃣ Find subscribed users
        const users = await User.find({
            isSubscribed: true,
            hour: currentHourUTC,
        }).select("chatId");

        if (!users.length) {
            console.log(`No subscribers at UTC hour ${currentHourUTC}`);
            return;
        }

        // 3️⃣ Send to each user
        for (const { chatId } of users) {
            try {
                await bot.api.sendMessage(chatId, message, {
                    parse_mode: "MarkdownV2",
                    reply_markup: buildInlineKeyboard({
                        hints: potd.hints,
                        link: potd.link,
                    }),
                });

                if (images.length > 0) {
                    await bot.api.sendMediaGroup(
                        chatId,
                        images.map((img) => ({
                            type: "photo",
                            media: img,
                        }))
                    );
                }
                await new Promise(res => setTimeout(res, 40));

            } catch (error) {
                console.error(`❌ Failed for user ${chatId}:`, error.message);

                // Optional: auto-unsubscribe if bot blocked
                if (error?.response?.description?.includes("bot was blocked")) {

                    await User.updateOne(
                        { chatId },
                        { $set: { isSubscribed: false } }
                    );
                }
            }
        }


        console.log(
            `✅ Sent daily LeetCode to ${users.length} users (full format)`
        );
    } catch (err) {
        console.error("❌ Daily job failed:", err);
    }
};
