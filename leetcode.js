import fetch from "node-fetch";

/**
 * Cache per UTC day (LeetCode resets at 00:00 UTC)
 */
let cachedPOTD = null;
let cachedUTCDateKey = null;

/**
 * Returns a unique key for current UTC day
 * Example: "2026-0-17"
 */
const getUTCDateKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
};

export const getDailyProblem = async () => {
  const todayUTCKey = getUTCDateKey();

  // ✅ Serve from cache if same UTC day
  if (cachedPOTD && cachedUTCDateKey === todayUTCKey) {
    return cachedPOTD;
  }

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
      timeout: 15000, // ✅ prevents hanging requests
    });
  } catch (err) {
    throw new Error("Network error while fetching LeetCode Daily");
  }

  if (!response.ok) {
    throw new Error(`LeetCode API failed: ${response.status}`);
  }

  const json = await response.json();
  const data = json?.data?.activeDailyCodingChallengeQuestion;

  if (!data || !data.question) {
    throw new Error("Invalid LeetCode response structure");
  }

  // ⚠️ Best-effort constraint extraction (HTML is unstable)
  const constraintsMatch = data.question.content.match(
    /<strong>Constraints:<\/strong>[\s\S]*?<ul>[\s\S]*?<\/ul>/i
  );

  cachedPOTD = {
    title: data.question.title,
    difficulty: data.question.difficulty,
    content: data.question.content, // raw HTML (convert later for Telegram)
    constraints: constraintsMatch ? constraintsMatch[0] : "",
    hints: data.question.hints || [],
    link: `https://leetcode.com${data.link}`,
  };

  // ✅ Update cache key AFTER successful fetch
  cachedUTCDateKey = todayUTCKey;

  return cachedPOTD;
};
