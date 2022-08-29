const mongoose = require("mongoose")
const crypto = require("crypto")

const jwt = require("jsonwebtoken")

const { Schema } = mongoose

const UsersSchema = new Schema({
    email: String,
    address: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "user" },
    password: String,
    idNum: Number
}, {
    timestamps: true
})

UsersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex")
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
        .toString("hex")
}

UsersSchema.methods.validatePassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
        .toString("hex")
    return this.hash === hash
}

UsersSchema.methods.links = async function () {
    let links = []
    links = await Link.find({ userId: this._id })
    return links
}

UsersSchema.methods.generateJWT = function () {
    const data = {
        _id: this._id,
        role: this.role,
        email: this.email,
        name: this.name,
    }
    const signature = process.env.SECRET_KEY
    const expiration = "6h"

    return jwt.sign(data, signature)
}

UsersSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        name: this.name,
        token: this.generateJWT()
    }
}

var User = mongoose.model("user", UsersSchema)

module.exports = User
