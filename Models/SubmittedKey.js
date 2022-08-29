const mongoose = require("mongoose")
const crypto = require("crypto")

const jwt = require("jsonwebtoken")

const { Schema } = mongoose

const SubmittedKeySchema = new Schema({
    publicKey: String,
    refNum: Number,
    user: { type: Schema.Types.ObjectId, ref: "user" },
}, {
    timestamps: true
})

var SubmittedKey = mongoose.model("submittedkey", SubmittedKeySchema)

module.exports = SubmittedKey
