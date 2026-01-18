import cron from "node-cron";
import { getSubscribers } from "./store.js";
import { getDailyProblem } from "./leetcode.js";
import { buildTelegramMessage } from "./utils.js";
import { bot } from "./index.js"; // wherever bot is exported

cron.schedule("0 * * * *", async () => {
    const now = new Date().getHours();
    const users = getSubscribers();

    if (!users.length) return;

    const potd = await getDailyProblem();

    for (const user of users) {
        if (user.hour === now) {
            await bot.api.sendMessage(
                user.chatId,
                buildTelegramMessage({
                    title: potd.title,
                    mainText: potd.content,
                    constraintsText: potd.constraints,
                }),
                { parse_mode: "MarkdownV2" }
            );
        }
    }
});
