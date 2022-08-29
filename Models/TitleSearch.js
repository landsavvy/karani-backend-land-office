const mongoose = require("mongoose")
const crypto = require("crypto")

const jwt = require("jsonwebtoken")

const { Schema } = mongoose

const TitleSearchSchema = new Schema({
    complete: { type: Boolean, default: false },
    titleNum: String,
    searchNum: Number,
    blockNum: Number,
    deedFileName: String,
    searchFileName: String,
    surveyFileName: String,
    user: { type: Schema.Types.ObjectId, ref: "user" },
}, {
    timestamps: true
})

var TitleSearch = mongoose.model("titlesearch", TitleSearchSchema)

module.exports = TitleSearch
