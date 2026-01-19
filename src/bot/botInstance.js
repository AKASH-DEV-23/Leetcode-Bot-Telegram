import "dotenv/config";
import { Bot } from "grammy";

if (!process.env.BOT_TOKEN) {
    throw new Error("❌ BOT_TOKEN missing");
}

export const bot = new Bot(process.env.BOT_TOKEN);
