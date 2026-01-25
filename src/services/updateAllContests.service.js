import { updateLeetCodeContests } from "./leetcode.service.js";
import { updateCodeforcesContests } from "./codeforces.service.js";

export async function updateAllContests() {
    await updateLeetCodeContests();
    await updateCodeforcesContests();
}
