const { Kafka } = require('kafkajs')
const crypto = require("crypto")
const axios = require("axios")
const Common = require("./Common")

exports.add = async (req, res) => {
    await producer.connect()
    var peer = {
        name: req.body.name,
        peerId: req.body.peerId,
        businessNum: req.body.businessNum,
        publicKey: req.body.publicKey,
    }
    console.log("peer", peer)
    //query current blockNo
    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain

    var block = {
        txType: "peerAdd",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            peer
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
