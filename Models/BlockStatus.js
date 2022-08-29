const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const BlockStatusSchema = new Schema(
    {
        blockNum: Number,
        mixedId: String,
        blockData: String,
        comment: String,
        status: String,

    },
    {
        timestamps: true
    }
)
const BlockStatus = mongoose.model("blockstatus", BlockStatusSchema)
module.exports = BlockStatus
