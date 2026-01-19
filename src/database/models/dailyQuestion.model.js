import mongoose from "mongoose";

const DailyQuestionSchema = new mongoose.Schema(
    {
        // One document per UTC day
        dateKey: {
            type: String, // "2026-01-19"
            required: true,
            unique: true,
            index: true,
        },

        title: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },

        // Raw HTML (you already clean later)
        content: {
            type: String,
            required: true
        },

        constraints: {
            type: String,
            default: ""
        },

        hints: {
            type: [String],
            default: []
        },

        link: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("DailyQuestion", DailyQuestionSchema);
