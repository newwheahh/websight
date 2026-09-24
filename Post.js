const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        type: {
            type: String,

            enum: [
                "link",
                "document",
                "video"
            ],

            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            default: "Other"
        },

        url: {
            type: String,
            default: ""
        },

        fileName: {
            type: String,
            default: ""
        },

        originalName: {
            type: String,
            default: ""
        },

        mimeType: {
            type: String,
            default: ""
        },

        fileSize: {
            type: Number,
            default: 0
        },

        thumbnail: {
            type: String,
            default: ""
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        downloads: {
            type: Number,
            default: 0
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Post",
    postSchema
);