
const Common = require("./Common")
const axios = require("axios")
const TitleSearch = require("../Models/TitleSearch")
const Transfer = require("../Models/Transfer")
async function getLastTitleNum() {
    let response = await axios.get(process.env.MASTER_PEER + "/api/v1/title/getLastNum")
    let { lastNum } = response.data
    return lastNum
}
async function getLastSearchNum() {
    let response = await axios.get(process.env.MASTER_PEER + "/api/v1/search/getLastNum")
    let { lastNum } = response.data
    return lastNum
}

exports.add = async (req, res) => {

    let titleNum = await getLastTitleNum()

    var data = req.body
    var title = {
        titleNum: data.titleNum,
        ownerIds: data.ownerIds,
        coords: JSON.parse(data.coords),
        county: data.county,
        size: data.size,
        use: data.use,
        charges: data.charges,
        lastTransferDate: data.lastTransferDate,
    }
    console.log("title", title)
    //query current blockNo
    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain

    var block = {
        txType: "titleAdd",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            title
        })
    }
    //GOK sign
    block.gokSign = await Common.gokSign(block)
    await producer.send({
        topic: 'verifyBlock',
        messages: [{ value: JSON.stringify(block) }],
    })
    console.log("Create Socket", req.body.socketId)
    await Common.createVerficationSocket(block, req.body.socketId)
    console.log("sent block")
    res.send({ true: true })


}

exports.search = async (req, res) => {

    let user = req.user
    //get last search num
    // let searchNum = await getLastSearchNum()
    let searchNum = await TitleSearch.estimatedDocumentCount()
    //create block  
    var search = {
        requestedBy: user.name,
        searchNum,
        idNum: user.idNum,
        date: Date(),
        titleNum: req.body.titleNum,
    }
    console.log("search", search)
    //query current blockNo
    let newBlockNum = await Common.getNewBlockNum()
    //block data creation
    let title = await Common.getTitle(search.titleNum)
    let owners = await Promise.all(title.ownerIds.map(async id => {
        console.log("owner ids", id)
        let owner = await Common.getOwner(id)
        let o = {
            idNum: owner.idNum,
            address: owner.address,
            name: owner.name
        }
        console.log("owner", o)
        //create title deed
        return o
    }))
    console.log("owners", owners)
    //create title deed
    var deed = {
        owners,
        size: title.size,
        titleNum: title.titleNum,
        lastTransferDate: title.lastTransferDate,
        coords: title.coords,
        county: title.county
    }

    var searchDoc = {
        requestedBy: search.requestedBy,
        datePerformed: Date(),
        titleNum: title.titleNum,
        searchNum: search.searchNum,
        owners,
        size: title.size,
        charges: title.charges
    }
    var details = {
        searchDoc,
        deed
    }
    await TitleSearch.create({
        requestedBy: search.requestedBy,
        idNum: search.idNum,
        date: search.date,
        titleNum: search.titleNum,
        details,
    })
    console.log("TC: created new search")
    //add search details to block

    //send to verify chain
    var block = {
        txType: "titleSearch",
        blockNum: newBlockNum,
        txTime: Date.now(),
        data: JSON.stringify({
            details
        })
    }
    //GOK sign
    block.gokSign = await Common.gokSign(block)
    //create search record
    let ts = TitleSearch.create({
        complete: false,
        blockNum: block.blockNum,
        titleNum: search.titleNum,
        searchNum,
        user,
    })
    await Common.createVerficationSocket(block, req.body.socketId)
    await producer.send({
        topic: 'verifyBlock',
        messages: [{ value: JSON.stringify(block) }],
    })

    console.log("sent block")
    res.send({ true: true })


}
exports.searchResults = async (req, res) => {
    let user = req.user
    let results = await TitleSearch.find({
        user
    })
    res.send({ results })
}
exports.subdivide = async (req, res) => {
    var titleSubdivision = {
        stringData: req.body.stringData,
        signature: req.body.signature,
    }
    //simple validation

    //get title numbers
    let titleNum = await getLastTitleNum()
    var subdivisionNumber = JSON.parse(JSON.parse(titleSubdivision.stringData).subCoords).length

    titleSubdivision.firstTitleNum = titleNum + 1
    let newBlockNum = await Common.getNewBlockNum()
    //send to verify chain
    var block = {
        txType: "titleSubdivide",
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
    res.send({ true: true })

}
