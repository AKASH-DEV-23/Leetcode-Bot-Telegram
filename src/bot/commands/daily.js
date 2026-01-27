import { getDailyProblem } from "../../services/leetcodeDaily.service.js"
import {
    extractImages,
    cleanText,
    buildInlineKeyboard,
} from "../../utils/formatter.js";

import { buildTelegramMessage, escapeMarkdownV2 } from "../../utils/markdown.js";

const dailyCooldown = new Map();
const DAILY_COOLDOWN_MS = 10 * 1000;

export default function dailyCommand(bot) {
    bot.command("daily", async (ctx) => {
        try {
            const userId = ctx.from.id;
            const now = Date.now();

            const lastUsed = dailyCooldown.get(userId);
            if (lastUsed && now - lastUsed < DAILY_COOLDOWN_MS) {
                const wait = Math.ceil(
                    (DAILY_COOLDOWN_MS - (now - lastUsed)) / 1000
                );
                return ctx.reply(`⏳ Please wait ${wait}s before /daily again.`);
            }

            dailyCooldown.set(userId, now);

            setTimeout(() => {
                dailyCooldown.delete(userId);
            }, DAILY_COOLDOWN_MS);


            const potd = await getDailyProblem();
            const { mainText, constraintsText } = cleanText(
                potd.content,
                potd.constraints
            );

            await ctx.reply(
                buildTelegramMessage({
                    title: potd.title,
                    mainText,
                    constraintsText,
                }),
                {
                    parse_mode: "MarkdownV2",
                    reply_markup: buildInlineKeyboard({
                        hints: potd.hints,
                        link: potd.link,
                    }),
                }
            );

            for (const img of extractImages(potd.content)) {
                await ctx.replyWithPhoto(img);
            }
        } catch {
            ctx.reply("❌ Failed to load today's interview question.");
        }
    });

    /* ---------- HINT BUTTON ---------- */
    bot.callbackQuery(/^hint_\d+$/, async (ctx) => {
        const potd = await getDailyProblem();
        const index = Number(ctx.callbackQuery.data.split("_")[1]);

        await ctx.answerCallbackQuery();
        if (!potd.hints[index]) return;

        await ctx.reply(
            `💡 *Hint ${index + 1}*\n\n${escapeMarkdownV2(potd.hints[index])}`,
            { parse_mode: "MarkdownV2" }
        );
    });

    /* ---------- DIFFICULTY BUTTON ---------- */
    bot.callbackQuery("difficulty", async (ctx) => {
        const potd = await getDailyProblem();
        await ctx.answerCallbackQuery();

        await ctx.reply(`⚡ *Difficulty*\n\n${potd.difficulty}`, {
            parse_mode: "Markdown",
        });
    });
}



