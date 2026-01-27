export default function communityCommand(bot) {
    bot.command("community", async (ctx) => {
        return ctx.reply(
            "💬 *Join Our Developer Community*\n\n" +
            "Discuss contests, share solutions, and grow together 🚀\n\n" +
            "Click below to join:",
            {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔥 Join Discussion Group",
                                url: "https://t.me/leetcode_bot_discussion"
                            }
                        ]
                    ]
                }
            }
        );
    });
}
