const bcrypt = require("bcryptjs")
const User = require("../models/User")
const SubmittedKey = require("../models/SubmittedKey")

const validator = require("validator")


exports.login = async (req, res) => {
    //get user
    let person = req.body.user

    let errors = []
    let user = await User.findOne({ email: person.email })

    if (!user) {
        errors.push("wrong-pass")
        return res.send({ errors })
    }
    //return res.send(user)
    if (await bcrypt.compare(person.password, user.password)) {
        return res.send({ token: user.generateJWT(), errors })
    }
    errors.push("wrong-pass")
    return res.send({ errors })
}
exports.submitKey = async (req, res) => {
    //get user
    let publicKey = req.body.publicKey
    let user = req.user

    let errors = []
    let num = (await SubmittedKey.estimatedDocumentCount()) + 1
    let keyref = await SubmittedKey.create({
        publicKey,
        user,
        refNum: num
    })

    return res.send({ num, errors })


}
exports.getDetails = async (req, res) => {
    //get user   
    let user = req.user

    let errors = []

    user = {
        idNum: user.idNum,
        email: user.email,
        name: user.name
    }
    return res.send({ user, errors })


}
exports.searchKeyRef = async (req, res) => {
    //get user

    let errors = []
    try {
        var query = Number(req.body.query)
    } catch (ex) {
        errors.push("key-ref-not-found")
        return res.send({ errors })
    }

    let user = req.user
    //get submitted keys with ref
    let keyref = await SubmittedKey.findOne({ refNum: query }).populate("user")
    if (!keyref) {
        errors.push("key-ref-not-found")
        return res.send({ errors })
    }
    //console.log("Key Ref", keyref)
    let keyInfo = {
        name: keyref.user.name,
        refNum: keyref.refNum,
        idNum: keyref.user.idNum
    }
    return res.send({ keyInfo, errors })

}

exports.signup = async (req, res) => {
    console.log(req.params)
    console.log(req.body)
    let errors = []
    let person = req.body.user
    //errors = validateAll(data.email, data.password)
    //check for bad usernames


    //check password length
    if (person.password.length < 6 || person.password.length > 20) {
        errors.push("password-length")
        return res.send({ errors })
    }


    //check if email exists in DB
    let dup = await User.findOne({ email: person.email })
    if (dup) {
        errors.push("username-exists")
        return res.send({ errors })
    }
    //hashing
    const hashed = await bcrypt.hash(person.password, 10)

    let user = new User({
        email: person.email,
        idNum: person.idNum,
        name: person.firstName + " " + person.lastName,
        role: "user",
        password: hashed
    })
    await user.save()
    console.log(user)
    console.log(process.env.SECRET_KEY)
    res.send({ token: user.generateJWT(), errors })
}

function validateMail(email) {
    let errors = []
    //check email
    if (!validateEmail(email)) {
        errors.push("email-invalid")
    }

    return errors
}
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}
