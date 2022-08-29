const mongoose = require("mongoose")
const { Schema } = mongoose

const SubdivisionSchema = new Schema(
    {
        titleNum: String,
        coords: String,
        refNum: String,
        signatures: String,
        blockNum: Number,
        boardApproval: { type: Boolean, default: false },
        registrarApproval: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: "user" },
    }, {
    timestamps: true
}
)
var Subdivision = mongoose.model("subdivision", SubdivisionSchema)

module.exports = Subdivision
