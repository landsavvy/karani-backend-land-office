const Transfer = require("../Models/Transfer")
const Common = require("./Common")
const axios = require("axios")
exports.registrarTransfer = async (req, res) => {
    var titleTransfer = {
        signatures: req.body.signatures,
    }
    //simple validation

    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain
    var block = {
        txType: "titleTransfer",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            titleTransfer
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
exports.userTransfer = async (req, res) => {
    let user = req.user
    var signatures = req.body.signatures
    let sig = signatures[0]

    let ownerIds = []
    for (let sign of signatures) {
        ownerIds.push(sign.currentOwnerId)
    }

    let refNum = "TR-" + (await Transfer.estimatedDocumentCount())
    //create transfer
    await Transfer.create({
        titleNum: sig.titleNum,
        from: ownerIds,
        refNum,
        to: sig.newOwnerIds.split(","),
        signatures: JSON.stringify(signatures),
        user
    })
    res.send({ true: true })

}
exports.transferResults = async (req, res) => {
    let user = req.user
    let results = await Transfer.find({
        user
    })
    res.send({ results })
}
exports.getTransfer = async (req, res) => {
    //get user

    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let transfer = await Transfer.findOne({ refNum: query }).populate("user")
    if (!transfer) {
        errors.push("key-ref-not-found")
        return res.send({ errors })
    }
    return res.send({ transfer, errors })
}
exports.boardApproval = async (req, res) => {
    let errors = []
    let transfer = await Transfer.findOne({ refNum: req.body.refNum })
    transfer.boardApproval = true
    await transfer.save()
    res.send({ errors })
}
exports.registrarApproval = async (req, res) => {
    let errors = []
    let transfer = await Transfer.findOne({ refNum: req.body.refNum })
    transfer.registrarApproval = true
    await transfer.save()
    //create block chain
    var titleTransfer = {
        refNum: transfer.refNum,
        signatures: JSON.parse(transfer.signatures),
    }
    //simple validation
    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain
    var block = {
        txType: "titleTransfer",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            titleTransfer
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

exports.completeTransfer = async (block) => {
    let titleTransfer = JSON.parse(block.data).titleTransfer
    let transfer = await Transfer.findOne({ refNum: titleTransfer.refNum })
    transfer.blockNum = block.blockNum
    await transfer.save()
    console.log("Updated Transfer: Block Num")

}


