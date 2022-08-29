
const axios = require("axios")
const Common = require("./Common")
exports.add = async (req, res) => {
    var witness = {
        name: req.body.name,
        businessNum: req.body.businessNum,
        publicKey: req.body.publicKey,
    }
    //simple validation

    console.log("master peer", process.env.MASTER_PEER)
    //add to room

    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain

    var block = {
        txType: "witnessAdd",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            witness
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
