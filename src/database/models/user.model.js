import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        chatId: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

        // Subscription status
        isSubscribed: {
            type: Boolean,
            default: false,
        },

        // Hour in UTC (0–23) when daily question is sent
        hour: {
            type: Number,
            min: 0,
            max: 23,
            default: null,
        },

        lastSeen: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);
