
const BlockStatus = require("../Models/BlockStatus")

const SearchController = require("../Controllers/SearchController")
const SubdivideController = require("../Controllers/SubdivideController")
const TransferController = require("../Controllers/TransferController")

exports.confirm = async (block) => {
  console.log("Confirm block", block.confirmStatus, block.blockNum)
  console.log("Confirm comment", block.comment)
  var mixedId = "num" + block.blockNum + "time" + block.txTime
  var status = await BlockStatus.findOne({ mixedId })
  var confirmStatus = block.confirmStatus ? "confirmed" : "rejected"
  //check block time for both   
  if (status) {
    //return
    return
  }
  //handle accept states
  if (confirmStatus == "confirmed") {
    if (block.txType == "titleSearch") {
      SearchController.completeTitleSearch(block)
    }
    if (block.txType == "titleSubdivision") {
      SubdivideController.completeSubdivide(block)
    }
    if (block.txType == "titleTransfer") {
      TransferController.completeTransfer(block)
    }
  }

  var status = await BlockStatus.create({
    blockNum: block.blockNum,
    mixedId,
    blockData: JSON.stringify(block),
    comment: block.comment,
    status: confirmStatus,
  })
  console.log("Emmit Confirm status")
  io.to(mixedId).emit("confirmStatus", status)

}
exports.getStatus = async (req, res) => {
  var mixedId = req.body.mixedId
  console.log("mixedId", mixedId)
  var status = await BlockStatus.findOne({ mixedId })
  return res.send({ status })
}

