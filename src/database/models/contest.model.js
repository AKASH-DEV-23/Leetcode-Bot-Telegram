import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
    {
        platform: {
            type: String,
            required: true,
            enum: ["lc", "cf"],
        },
        title: {
            type: String,
            required: true,
        },
        titleSlug: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// Important index for fast queries
contestSchema.index({ platform: 1, startTime: 1 });

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
