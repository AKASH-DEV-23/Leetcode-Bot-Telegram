import { PLATFORM_CONFIG } from "../../config/plateform.js";
import Contest from "../../database/models/contest.model.js";

export default function contestCommand(bot) {

    /* ----------------------------------
       MAIN /contest COMMAND
    ----------------------------------- */

    bot.command("contest", async (ctx) => {
        try {
            const args = ctx.match?.trim().split(" ") || [];

            const platform = args[0]?.toLowerCase();
            const range = args[1]?.toLowerCase();

            // If only /contest → show buttons
            if (!platform || !range) {
                return ctx.reply(
                    "📅 *Choose Contest Option:*",
                    {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "🔥 LC Today", callback_data: "contest_lc_today" },
                                    { text: "🚀 LC Upcoming", callback_data: "contest_lc_upcoming" }
                                ],
                                [
                                    { text: "🔥 CF Today", callback_data: "contest_cf_today" },
                                    { text: "🚀 CF Upcoming", callback_data: "contest_cf_upcoming" }
                                ]
                            ]
                        }
                    }
                );
            }

            return handleContest(ctx, platform, range);

        } catch (error) {
            console.error("Contest command error:", error);
            await ctx.reply("Something went wrong.");
        }
    });


    /* ----------------------------------
       BUTTON HANDLER (THIS WAS MISSING)
    ----------------------------------- */

    bot.callbackQuery(/^contest_(.+)_(.+)$/, async (ctx) => {
        try {
            const platform = ctx.match[1];
            const range = ctx.match[2];

            await ctx.answerCallbackQuery(); // remove loading spinner

            return handleContest(ctx, platform, range);

        } catch (error) {
            console.error("Callback error:", error);
        }
    });
}


/* ----------------------------------
   CORE LOGIC (moved from your code)
----------------------------------- */

async function handleContest(ctx, platform, range) {

    if (!PLATFORM_CONFIG[platform]) {
        return ctx.reply("Unsupported platform.");
    }

    if (!["today", "upcoming"].includes(range)) {
        return ctx.reply("Range must be: today | upcoming");
    }

    const now = new Date();
    let filter = { platform };

    if (range === "today") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        filter.startTime = {
            $gte: startOfToday,
            $lte: endOfToday,
        };
    }

    if (range === "upcoming") {
        filter.startTime = { $gte: now };
    }

    const contests = await Contest.find(filter).sort({ startTime: 1 });

    if (!contests.length) {
        return ctx.reply("No contests found.");
    }

    const platformName = PLATFORM_CONFIG[platform].name;
    let message = `🔥 *${platformName} Contests*\n\n`;

    for (const c of contests) {

        const endTime = new Date(
            c.startTime.getTime() + c.duration * 1000
        );

        const isLive = now >= c.startTime && now <= endTime;

        const durationHours = Math.floor(c.duration / 3600);
        const durationMinutes = Math.floor((c.duration % 3600) / 60);

        const startDate = c.startTime.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
        });

        const startTime = c.startTime.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
        });

        const endIST = endTime.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
        });

        const url =
            PLATFORM_CONFIG[platform].baseUrl + c.titleSlug;

        let countdownText = "";

        if (!isLive && now < c.startTime) {
            const diffMs = c.startTime - now;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
                (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );

            countdownText = `⏳ Starts in ${hours}h ${minutes}m\n`;
        }

        message +=
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🏆 *${c.title}*\n\n` +
            `📅 *${startDate}*\n` +
            `🕒 ${startTime} – ${endIST} (IST)\n` +
            `⏱ ${durationHours}h ${durationMinutes}m\n` +
            (isLive
                ? `🟢 *LIVE NOW*\n`
                : countdownText ? `${countdownText.trim()}\n` : "") +
            `\n🔗 [Open Contest](${url})\n\n`;

    }

    return ctx.reply(message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
    });
}
