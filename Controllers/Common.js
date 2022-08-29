const axios = require("axios")
const crypto = require("crypto")
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
exports.getNewBlockNum = async () => {
    //query current blockNo
    let response = await axios.get(process.env.MASTER_PEER + "/api/v1/block/getLast")
    let { lastNum } = response.data
    return lastNum + 1
}
exports.getTitle = async (titleNum) => {

    let response = await axios.post(process.env.MASTER_PEER + "/api/v1/title/getTitle", { titleNum })
    let { title } = response.data
    return title
}
exports.getOwner = async (id) => {
    //query current blockNo
    let response = await axios.post(process.env.MASTER_PEER + "/api/v1/owner/getOwner", { idNum: id })
    let { owner } = response.data
    return owner
}
exports.getBlockWait = async (blockNum) => {
    //query current blockNo
    let block = await this.getBlock(blockNum)

    if (!block) {
        while (block == null) {
            block = await this.getBlock(blockNum)
            await sleep(200)
        }
    }
    return block
}
exports.getBlock = async (blockNum) => {
    //query current blockNo
    let response = await axios.post(process.env.MASTER_PEER + "/api/v1/block/getBlock", { blockNum })
    let { block } = response.data
    return block
}
exports.createVerficationSocket = async (block, socketId) => {
    io.of('/').adapter.remoteJoin(socketId, "num" + block.blockNum + "time" + block.txTime)
}
exports.gokSign = async (block) => {
    var signer = crypto.createSign('RSA-SHA256');
    signer.update(JSON.stringify(block));
    signer.end();
    var signature = signer.sign(GOK_PRIVATE_KEY, 'base64')
    return signature
}