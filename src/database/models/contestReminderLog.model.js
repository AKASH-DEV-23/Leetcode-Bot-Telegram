import mongoose from "mongoose";

const contestReminderLogSchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
            index: true,
        },
        chatId: {
            type: Number,
            required: true,
            index: true,
        },
        hoursBefore: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reminder
contestReminderLogSchema.index(
    { contestId: 1, chatId: 1, hoursBefore: 1 },
    { unique: true }
);

export default mongoose.model(
    "ContestReminderLog",
    contestReminderLogSchema
);
