# 🤖 LeetCode Daily POTD Telegram Bot

A Telegram bot that delivers **LeetCode’s Daily Problem of the Day (POTD)** directly to users with a clean, interactive experience.

🌍 **Live Bot:**   https://t.me/LeetCodeNotifier_Bot

---

## ✨ Features

- 📅 Fetches **LeetCode Daily POTD**
- 🧩 Sends problem title, description & constraints
- 💡 Interactive **Hints** (inline buttons)
- ⚡ Difficulty indicator (Easy / Medium / Hard)
- 🔗 Direct link to solve on LeetCode
- ⏳ Rate-limited `/daily` command
- 🚀 Fast & scalable **Webhook-based bot**
- ☁️ Deployed on AWS

---

## 🛠 Tech Stack

- **Node.js**
- **Grammy** (Telegram Bot Framework)
- **Express.js**
- **AWS** (Deployment)
- **Telegram Webhooks**

---

## 🚀 Bot Commands

| Command | Description |
|--------|------------|
| `/daily` | Get today’s LeetCode POTD |

---

## 🔗 Bot Workflow

```text
Telegram User
   ↓
Telegram Webhook
   ↓
Render (Express Server)
   ↓
Grammy Bot
   ↓
LeetCode POTD Data

```

## ⚙️ Deployment Details

### 🌐 Production URL
🔗 **Live App:**  
https://leetcode-bot-telegram.com

---

### 🔔 Webhook Setup

Replace `<BOT_TOKEN>` with your actual Telegram bot token and run the following URL in your browser or via `curl`:

```bash
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?drop_pending_updates=true&url=https://leetcode-bot-telegram.com/webhook
```

## ✅ Verify Webhook

To confirm that the webhook is set correctly, open the following URL in your browser  
(after replacing `<BOT_TOKEN>` with your actual Telegram bot token):

```bash
https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

## 🧪 Local Development

### Install Dependencies

```bash
npm install
```
### Start Development Server

```bash
npm install
```
The bot will run on: http://localhost:3000

## 💡 Note:

For local webhook testing, use Cloudflare Tunnel or ngrok to expose your local server to the internet.

## 📌 Future Improvements

- **🔔 Auto daily push to subscribed users**  
- **📊 User stats & streaks**  
- **🏆 Weekly leaderboard**  
- **🔐 Secure webhook with secret path**

## 👨‍💻 Author

- Akash Kumar
- Full-Stack Developer
- GitHub: https://github.com/AKASH-DEV-23
