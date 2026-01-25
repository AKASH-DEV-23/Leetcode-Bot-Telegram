import Contest from "../database/models/contest.model.js";

export async function replacePlatformContests(platform, docs) {
    if (!Array.isArray(docs)) {
        throw new Error("Docs must be an array");
    }

    await Contest.deleteMany({ platform });

    if (docs.length > 0) {
        await Contest.insertMany(docs);
    }
}
