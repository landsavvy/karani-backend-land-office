const jwt = require("express-jwt")
const User = require("../models/User")
require("dotenv").config()

function getTokenFromHeader(req, res, next) {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        var tokenRaw = req.headers.authorization.split(" ")[1]
    }
    return tokenRaw
}
async function addUser(req, res, next) {
    // console.log(req.authUser)
    let user = req.authUser
    const userRecord = await User.findOne({ _id: user._id })

    req.user = userRecord

    if (!userRecord) {
        return res.status(401).end("User token error")
    } else {
        return next()
    }
}
module.exports = [
    jwt({
        secret: process.env.SECRET_KEY,
        userProperty: "authUser",
        algorithms: ['HS256']
        // getToken: getTokenFromHeader
    }),
    addUser
]
