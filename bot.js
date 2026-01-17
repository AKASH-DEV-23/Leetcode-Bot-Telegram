import "dotenv/config";
import { Bot } from "grammy";
import { getDailyProblem } from "./leetcode.js";
import express from "express";


import {
  extractImages,
  cleanText,
  buildTelegramMessage,
  buildInlineKeyboard,
  formatDifficulty,
  escapeMarkdownV2
} from "./utils.js";


if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing");
  process.exit(1);
}

export const bot = new Bot(process.env.BOT_TOKEN);

// bot.use(async (ctx, next) => {
//   console.log("📩 Update received:", ctx.update.update_id);
//   await next();
// });


/* ----------------------------------
   ERROR HANDLER
----------------------------------- */
bot.catch((err) => {
  console.error("❌ Bot error:", err.error || err);
});

/* ----------------------------------
   RATE LIMIT (/daily)
----------------------------------- */
const dailyCooldown = new Map();
const DAILY_COOLDOWN_MS = 10 * 1000; // 10 delay

/* ----------------------------------
   /daily COMMAND
----------------------------------- */
bot.command("daily", async (ctx) => {

  try {
    const userId = ctx.from.id;
    const now = Date.now();

    const lastUsed = dailyCooldown.get(userId);
    if (lastUsed && now - lastUsed < DAILY_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (DAILY_COOLDOWN_MS - (now - lastUsed)) / 1000
      );
      return ctx.reply(
        `⏳ Please wait ${waitSeconds}s before requesting /daily again.`
      );
    }

    dailyCooldown.set(userId, now);

    // Fetch Daily Problem
    const potd = await getDailyProblem();

    const { mainText, constraintsText } = cleanText(
      potd.content,
      potd.constraints
    );

    const images = extractImages(potd.content);

    // 1️⃣ MAIN BEAUTIFUL MESSAGE
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

    // 2️⃣ SEND IMAGES AFTER EXAMPLES
    for (const img of images) {
      await ctx.replyWithPhoto(img);
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Failed to load today's interview question.");
  }
});

bot.on("message:text", async (ctx, next) => {
  const text = ctx.message.text.trim();

  // Allow /daily (and /daily@BotName)
  if (text === "/daily" || text.startsWith("/daily@")) {
    return next();
  }

  // Any other text or command
  return ctx.reply("ℹ️ Available command is /daily");
});


/* ----------------------------------
   BUTTON HANDLERS (STATELESS)
----------------------------------- */

// HINT BUTTONS
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


// DIFFICULTY BUTTON
bot.callbackQuery("difficulty", async (ctx) => {
  const potd = await getDailyProblem();

  let badge;
  switch (potd.difficulty) {
    case "Easy":
      badge = "🟢 EASY";
      break;
    case "Medium":
      badge = "🟡 MEDIUM";
      break;
    case "Hard":
      badge = "🔴 HARD";
      break;
    default:
      badge = potd.difficulty;
  }

  // Acknowledge button click (no popup)
  await ctx.answerCallbackQuery();

  // Send difficulty as a normal message
  await ctx.reply(`⚡ *Difficulty*\n\n${badge}`, {
    parse_mode: "Markdown",
  });
});



/* ----------------------------------
   BOT STARTUP
----------------------------------- */
// export const startBot = async () => {
//   try {
//     await bot.api.deleteWebhook({ drop_pending_updates: true });
//     console.log("✅ Webhook cleared");
//   } catch (err) {
//     console.warn("⚠️ deleteWebhook failed (network issue), skipping...");
//   }

//   try {
//     await bot.api.setMyCommands([
//       {
//         command: "daily",
//         description: "Today's POTD",
//       },
//     ]);
//   } catch (e) {
//     console.warn("⚠️ setMyCommands failed, continuing...");
//   }

//   console.log("🤖 Bot running (polling started)");
//   await bot.start();
// };

// startBot();


const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  // Respond immediately to Telegram
  res.sendStatus(200);

  // Handle update asynchronously
  bot.handleUpdate(req.body).catch(err => {
    console.error("❌ Bot update error:", err);
  });
});

app.get("/", (req, res) => {
  res.send("LeetCode Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await bot.init(); // 🔥 REQUIRED FOR WEBHOOK
    console.log("🤖 Bot initialized");

    await bot.api.setMyCommands([
      { command: "daily", description: "Today's POTD" },
    ]);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start bot:", err);
    process.exit(1);
  }
})();
