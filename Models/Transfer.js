const mongoose = require("mongoose")
const { Schema } = mongoose

const TransferSchema = new Schema(
    {
        titleNum: String,
        refNum: String,
        from: [String],
        to: [String],
        signatures: String,
        blockNum: Number,
        boardApproval: { type: Boolean, default: false },
        registrarApproval: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: "user" },

    }, {
    timestamps: true
}
)
var Transfer = mongoose.model("transfer", TransferSchema)

module.exports = Transfer
