import { replacePlatformContests } from "./contest.service.js";

const LEETCODE_API = "https://leetcode.com/graphql";

export async function updateLeetCodeContests() {
    try {
        const response = await fetch(LEETCODE_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
            body: JSON.stringify({
                query: `
          query {
            upcomingContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
            }),
        });

        if (!response.ok) {
            throw new Error(`LeetCode API failed: ${response.status}`);
        }

        const data = await response.json();
        const contests = data?.data?.upcomingContests || [];

        const docs = contests.map((c) => ({
            platform: "lc",
            title: c.title,
            titleSlug: c.titleSlug,
            startTime: new Date(c.startTime * 1000),
            duration: c.duration,
        }));

        await replacePlatformContests("lc", docs);

        console.log("✅ LeetCode contests updated");

    } catch (error) {
        console.error("❌ LeetCode update failed:", error.message);
    }
}
