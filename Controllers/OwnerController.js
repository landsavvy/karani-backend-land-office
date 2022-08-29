const Common = require("./Common")
const SubmittedKey = require("../models/SubmittedKey")
exports.add = async (req, res) => {
  await producer.connect()
  var user = req.body.user
  //get public key
  let keyRef = await SubmittedKey.findOne({ refNum: user.refNum })
  var owner = {
    name: user.name,
    idNum: user.idNum,
    witnessNum: user.witnessNum,
    address: user.address,
    publicKey: keyRef.publicKey,
  }
  console.log("owner", owner)
  //query current blockNo
  let newBlockNum = await Common.getNewBlockNum()
  //send to verify chain

  var block = {
    txType: "ownerAdd",
    blockNum: newBlockNum,
    txTime: Date.now(),
    data: JSON.stringify({
      owner
    })
  }
  //GOK sign
  block.gokSign = await Common.gokSign(block)
  await Common.createVerficationSocket(block, req.body.socketId)
  await producer.send({
    topic: 'verifyBlock',
    messages: [{ value: JSON.stringify(block) }],
  })

  console.log("sent block")
  res.send({ true: true })


}

exports.addMigrate = async (req, res) => {

  var owner = req.body.owner

  console.log("owner", owner)
  //query current blockNo
  let newBlockNum = await Common.getNewBlockNum()
  //send to verify chain

  var block = {
    txType: "ownerAdd",
    blockNum: newBlockNum,
    txTime: Date.now(),
    data: JSON.stringify({
      owner
    })
  }
  //GOK sign
  block.gokSign = await Common.gokSign(block)
  await Common.createVerficationSocket(block, req.body.socketId)
  await producer.send({
    topic: 'verifyBlock',
    messages: [{ value: JSON.stringify(block) }],
  })

  console.log("sent block")
  res.send({ true: true })


}

exports.changeKey = async (req, res) => {
  await producer.connect()
  var keyChange = {
    stringData: req.body.stringData,
    signature: req.body.signature,
  }
  //query current blockNo
  let newBlockNum = await Common.getNewBlockNum()
  //send to verify chain

  var block = {
    txType: "ownerChangeKey",
    blockNum: newBlockNum,
    txTime: Date.now(),
    data: JSON.stringify({
      keyChange
    })
  }
  //GOK sign
  block.gokSign = await Common.gokSign(block)
  await Common.createVerficationSocket(block, req.body.socketId)
  await producer.send({
    topic: 'verifyBlock',
    messages: [{ value: JSON.stringify(block) }],
  })

  console.log("sent block")
  res.send({ true: true })


}
exports.changeWitness = async (req, res) => {
  await producer.connect()
  var witnessChange = {
    stringData: req.body.stringData,
    signature: req.body.signature,
  }
  //query current blockNo
  let newBlockNum = await Common.getNewBlockNum()
  //send to verify chain

  var block = {
    txType: "ownerChangeWitness",
    blockNum: newBlockNum,
    txTime: Date.now(),
    data: JSON.stringify({
      witnessChange
    })
  }
  //GOK sign
  block.gokSign = await Common.gokSign(block)
  await Common.createVerficationSocket(block, req.body.socketId)
  await producer.send({
    topic: 'verifyBlock',
    messages: [{ value: JSON.stringify(block) }],
  })

  console.log("sent block")
  res.send({ true: true })


}