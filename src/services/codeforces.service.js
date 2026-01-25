import { replacePlatformContests } from "./contest.service.js";

export async function updateCodeforcesContests() {
    try {
        const response = await fetch(
            "https://codeforces.com/api/contest.list"
        );

        if (!response.ok) {
            throw new Error("Codeforces API failed");
        }

        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error("Invalid Codeforces response");
        }

        const upcoming = data.result.filter(
            (c) => c.phase === "BEFORE"
        );

        const docs = upcoming.map((c) => ({
            platform: "cf",
            title: c.name,
            titleSlug: c.id.toString(),
            startTime: new Date(c.startTimeSeconds * 1000),
            duration: c.durationSeconds,
        }));

        await replacePlatformContests("cf", docs);

        console.log("✅ Codeforces contests updated");

    } catch (error) {
        console.error("❌ Codeforces update failed:", error.message);
    }
}
