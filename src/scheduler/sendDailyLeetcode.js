import User from "../database/models/user.model.js";
import { bot } from "../bot/botInstance.js";
import { connectDB } from "../database/connect.js";
import { getDailyProblem } from "../services/leetcode.service.js";
import {
    cleanText,
    extractImages,
    buildInlineKeyboard,
} from "../utils/formatter.js";
import { buildTelegramMessage } from "../utils/markdown.js";

export const sendDailyLeetCode = async () => {
    try {
        await connectDB();

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
            // MAIN MESSAGE (with HINT + DIFFICULTY + LINK buttons)
            await bot.api.sendMessage(chatId, message, {
                parse_mode: "MarkdownV2",
                reply_markup: buildInlineKeyboard({
                    hints: potd.hints,
                    link: potd.link,
                }),
            });

            // IMAGES (same as /daily)
            for (const img of images) {
                await bot.api.sendPhoto(chatId, img);
            }
        }

        console.log(
            `✅ Sent daily LeetCode to ${users.length} users (full format)`
        );
    } catch (err) {
        console.error("❌ Daily job failed:", err);
    }
};
