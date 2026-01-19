import fetch from "node-fetch";
import DailyQuestion from "../database/models/dailyQuestion.model.js";

/**
 * UTC date key (LeetCode resets at 00:00 UTC)
 */
const getUTCDateKey = () =>
    new Date().toISOString().slice(0, 10);

/**
 * Fetch LeetCode Daily Question
 * MongoDB-backed
 */
export const getDailyProblem = async () => {
    const todayUTCKey = getUTCDateKey();

    // 1️⃣ Check MongoDB first
    const existing = await DailyQuestion.findOne({
        dateKey: todayUTCKey,
    }).lean();

    if (existing) {
        return existing;
    }

    // 2️⃣ Fetch from LeetCode
    const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        link
        question {
          title
          difficulty
          content
          hints
        }
      }
    }
  `;

    let response;
    try {
        response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com",
            },
            body: JSON.stringify({ query }),
            timeout: 15000,
        });
    } catch {
        throw new Error("Network error while fetching LeetCode Daily");
    }

    if (!response.ok) {
        throw new Error(`LeetCode API failed: ${response.status}`);
    }

    const json = await response.json();
    const data = json?.data?.activeDailyCodingChallengeQuestion;

    if (!data?.question) {
        throw new Error("Invalid LeetCode response structure");
    }

    // 3️⃣ Extract constraints (best effort)
    const constraintsMatch = data.question.content.match(
        /<strong>Constraints:<\/strong>[\s\S]*?<ul>[\s\S]*?<\/ul>/i
    );

    const dailyQuestion = {
        dateKey: todayUTCKey,
        title: data.question.title,
        difficulty: data.question.difficulty,
        content: data.question.content,
        constraints: constraintsMatch ? constraintsMatch[0] : "",
        hints: data.question.hints || [],
        link: `https://leetcode.com${data.link}`,
    };

    // 4️⃣ Save atomically (safe for race conditions)
    await DailyQuestion.updateOne(
        { dateKey: todayUTCKey },
        { $setOnInsert: dailyQuestion },
        { upsert: true }
    );

    return dailyQuestion;
};