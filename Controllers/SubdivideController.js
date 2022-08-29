const Subdivision = require("../Models/Subdivision")
const Common = require("./Common")
const axios = require("axios")
exports.registrarsub = async (req, res) => {
    var titlesub = {
        signatures: req.body.signatures,
    }
    //simple validation

    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain
    var block = {
        txType: "titlesub",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            titlesub
        })
    }
    await Common.createVerficationSocket(block, req.body.socketId)

    //GOK sign
    block.gokSign = await Common.gokSign(block)

    await producer.send({
        topic: 'verifyBlock',
        messages: [{ value: JSON.stringify(block) }],
    })
    console.log("sent block")
    res.send({ true: true })

}
exports.submitPlan = async (req, res) => {
    let user = req.user
    var signatures = req.body.signatures
    let sig = signatures[0]
    let ownerIds = []
    for (let sign of signatures) {
        ownerIds.push(sign.currentOwnerId)
    }
    let refNum = "SUB-" + (await Subdivision.estimatedDocumentCount())
    //create sub
    await Subdivision.create({
        titleNum: sig.titleNum,
        coords: sig.subCoords,
        signatures: String,
        refNum,
        signatures: JSON.stringify(signatures),
        user
    })
    res.send({ true: true })

}
exports.subdivideResults = async (req, res) => {
    let user = req.user
    let results = await Subdivision.find({
        user
    })
    res.send({ results })
}
exports.getSubdivision = async (req, res) => {
    //get user
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let sub = await Subdivision.findOne({ refNum: query }).populate("user")
    if (!sub) {
        errors.push("key-ref-not-found")
        return res.send({ errors })
    }
    return res.send({ sub, errors })
}
exports.boardApproval = async (req, res) => {
    let errors = []
    let sub = await Subdivision.findOne({ refNum: req.body.refNum })
    sub.boardApproval = true
    await sub.save()
    res.send({ errors })
}
exports.registrarApproval = async (req, res) => {
    let errors = []
    let sub = await Subdivision.findOne({ refNum: req.body.refNum })
    sub.registrarApproval = true

    //create block chain
    var titleSubdivision = {
        signatures: JSON.parse(sub.signatures),
        refNum: sub.refNum,
    }
    //simple validation
    let newBlockNum = await Common.getNewBlockNum()
    sub.blockNum = newBlockNum
    await sub.save()
    //send to verify chain
    var block = {
        txType: "titleSubdivision",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            titleSubdivision
        })
    }
    await Common.createVerficationSocket(block, req.body.socketId)
    //GOK sign
    block.gokSign = await Common.gokSign(block)
    await producer.send({
        topic: 'verifyBlock',
        messages: [{ value: JSON.stringify(block) }],
    })
    console.log("sent block")
    res.send({ errors })

}
exports.completeSubdivide = async (block) => {


}


