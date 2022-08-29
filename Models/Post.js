
const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const PostSchema = new Schema(
    {
        title: String,
        image: {
            has: { type: Boolean, default: false },
            url: { type: String, default: "" }
        },
        likesTotal: { type: Number, default: 0 },
        likesCurrentDay: { type: Number, default: 0 },
        likesDayTotal: { type: Number, default: 0 },

        owner: { type: Schema.Types.ObjectId, ref: "user" },
        anonymous: { type: Boolean, default: true },
        reports: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        comments: [{ type: Schema.Types.ObjectId, ref: "comment" }]

    },
    {
        timestamps: true
    }
)
const Post = mongoose.model("post", PostSchema)
module.exports = Post
