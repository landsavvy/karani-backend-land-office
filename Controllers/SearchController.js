const TitleSearch = require("../Models/TitleSearch")
const jsPDF = require("jspdf").jsPDF

const Common = require("./Common")
var Docxtemplater = require('docxtemplater');
//Node.js example
var ImageModule = require('open-docxtemplater-image-module');
var fs = require('fs');
var path = require('path');
var PizZip = require('pizzip');
var T2W = require('numbers2words');
var cmd = require('node-cmd');
const axios = require('axios');

let coat = fs.readFileSync("Controllers/coat.png")
const { exec } = require("child_process");
// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
var opts = {}
opts.centered = false; //Set to true to always center images
opts.fileType = "docx"; //Or pptx

//Pass your image loader
opts.getImage = function (tagValue) {
    return tagValue;
}

//Pass the function that return image size
opts.getSize = function (img, tagValue, tagName) {
    //img is the image returned by opts.getImage()
    //tagValue is 'examples/image.png'
    //tagName is 'image'
    //tip: you can use node module 'image-size' here
    return [900, 900];
}

var imageModule = new ImageModule(opts);
function replaceErrors(key, value) {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
        }, {});
    }
    return value;
}
exports.getResult = async (req, res) => {
    //get results
    let result = await TitleSearch.findById(req.body.id)
    console.log("ssResult", req.body.id)
    res.send({ result })
}
function errorHandler(error) {
    console.log(JSON.stringify({ error: error }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}

exports.completeTitleSearch = async (block) => {
    let search = await TitleSearch.findOne({ blockNum: block.blockNum })
    search.complete = true

    //get block
    block = await Common.getBlockWait(block.blockNum)
    //parse search data
    var details = JSON.parse(block.data).details

    var deedDoc = details.deed
    var searchDoc = details.searchDoc
    let surveyFileName = await createSurveyDoc2(searchDoc, deedDoc, block)
    let deedFileName = await createDeedDoc(deedDoc, block)
    let searchFileName = await createSearchDoc(searchDoc, deedDoc, block)


    search.deedFileName = deedFileName + ".pdf"
    search.searchFileName = searchFileName + ".pdf"
    search.surveyFileName = surveyFileName + ".pdf"
    await search.save()

}
function getMapImageBuffer(url, params) {
    return axios
        .get(url, {
            responseType: 'arraybuffer',
            params
        })
        .then(response => response.data)
}

async function createSurveyDoc2(searchDoc, deedDoc, block) {
    let pathString = "color:red|weight:1|fillcolor:white";
    let titleCoords = ""
    for (let coord of deedDoc.coords) {
        pathString += `|${coord.lat},${coord.lng}`;
        titleCoords += `Lat : ${coord.lat}, Lng: ${coord.lng} \n <w:br/>`
    }
    titleCoords = JSON.stringify(deedDoc.coords.map(c => { delete c._id; return c }))
    let mapImage = await getMapImageBuffer("http://maps.googleapis.com/maps/api/staticmap", {
        scale: 2,
        size: "600x600",
        maptype: "roadmap",
        sensor: false,
        key: process.env.GOOGLE_MAPS_KEY,
        path: pathString,
    })
    //name Address
    let nameAddress = ""
    for (owner of deedDoc.owners) {
        nameAddress += `${owner.name.toUpperCase()} ID/${owner.idNum} of ${owner.address} `
    }
    // one thousand two hundred thirty-four  
    let searchDate = dateWords[new Date(searchDoc.datePerformed).getDate() - 1]
    //set the templateVariables

    let doc = new jsPDF("p", "pt", "a2");
    //add banner
    doc.setFontSize(26);
    doc.text(5, 25, "SAMPLE");
    var imageWidth = 150;
    var pageWidth = doc.internal.pageSize.width;
    var centerPage = pageWidth / 2;
    var centerAnchor = centerPage - imageWidth / 2;
    doc.addImage(coat, "PNG", centerAnchor, 20, imageWidth, imageWidth);
    console.log("Fonts", doc.getFontList())
    var yPos = 200;
    doc.setFontSize(12);
    doc.setFont("Times", "Roman");
    doc.text(centerPage, yPos, "REPUBLIC OF KENYA", "center");
    yPos += 10;
    doc.setLineWidth(1);
    doc.line(centerPage - 50, yPos, centerPage + 50, yPos);
    yPos += 20;
    doc.text("THE LAND REGISTRATION ACT", centerPage, yPos, "center");
    yPos += 40;
    doc.setFontSize(28);
    // doc.setFontType("bold");
    doc.text(centerPage, yPos, "SURVEY MAP", "center");
    yPos += 30;
    doc.setFontSize(14);
    var leftPad = 50
    doc.setTextColor("#767676")
    doc.text(deedDoc.titleNum, leftPad + 120, yPos - 5)
    doc.text(searchDoc.searchNum.toString(), leftPad + 450, yPos - 5)
    doc.setTextColor("#000000")
    doc.text("TITLE NUMBER: ............................................... SEARCH NUMBER: .............................................", leftPad, yPos);
    yPos += 20;
    doc.setTextColor("#767676")
    doc.text(searchDate, leftPad + 120, yPos - 5)
    doc.text(new Date(searchDoc.datePerformed).toLocaleString('default', { month: 'long' }), leftPad + 300, yPos - 5)
    doc.text(new Date(searchDoc.datePerformed).getFullYear().toString(), leftPad + 450, yPos - 5)
    doc.setTextColor("#000000")
    doc.text("On the ............................................... day of .................................................. , ....................... the following were the subsisting entries on the register of the above mention title:", leftPad, yPos);
    yPos += 20;
    doc.text("Survey Map:", leftPad, yPos);
    yPos += 20;
    //insert map image
    doc.addImage(mapImage, "PNG", 50, yPos, 600, 600);
    yPos += 620;

    doc.text("Coordinates : ", leftPad, yPos);
    yPos += 20;
    doc.setTextColor("#767676")
    var splitCoords = doc.splitTextToSize(titleCoords, 1000);
    doc.text(splitCoords, leftPad + 100, yPos)
    doc.setTextColor("#000000")
    yPos += 40;
    doc.text("Blockchain, Block Number:", leftPad, yPos);
    yPos += 20;
    doc.setTextColor("#767676")
    doc.text(block.blockNum.toString(), leftPad + 100, yPos)
    doc.setTextColor("#000000")
    yPos += 20;

    console.log("Doc saved BlockDocument1")

    var UUID = Date.now()
    var surveyFileName = "SurveyDoc" + UUID
    var buf = doc.output();
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.  
    doc.save(path.resolve(__dirname, `../public/pdfs/${surveyFileName}.pdf`));
    return surveyFileName
}
async function createSurveyDoc(searchDoc, deedDoc, block) {
    //creat docx
    //Load the docx file as a binary
    var content = fs.readFileSync(path.resolve(__dirname, '../public/templates/SurveyTemplateVar.docx'), 'binary');
    var zip = new PizZip(content);
    var doc;

    //get axios
    //pathstring
    let pathString = "color:red|weight:1|fillcolor:white";
    let titleCoords = ""
    let pre = '<w:p><w:r><w:t>';
    let post = '</w:t></w:r></w:p>';


    for (let coord of deedDoc.coords) {
        pathString += `|${coord.lat},${coord.lng}`;
        titleCoords += `Lat : ${coord.lat}, Lng: ${coord.lng} \n <w:br/>`
    }
    titleCoords = JSON.stringify(deedDoc.coords.map(c => { delete c._id; return c }))
    let mapImage = await getMapImageBuffer("http://maps.googleapis.com/maps/api/staticmap", {
        scale: 2,
        size: "1200x1200",
        maptype: "roadmap",
        sensor: false,
        key: process.env.GOOGLE_MAPS_KEY,
        path: pathString,
    })
    //name Address
    let nameAddress = ""
    for (owner of deedDoc.owners) {
        nameAddress += `${owner.name.toUpperCase()} ID/${owner.idNum} of ${owner.address} `
    }
    // one thousand two hundred thirty-four  
    let searchDate = dateWords[new Date(searchDoc.datePerformed).getDate() - 1]
    //set the templateVariables

    try {
        doc = new Docxtemplater().attachModule(imageModule).loadZip(zip)
            .setData({
                nameAddress,
                titleNum: deedDoc.titleNum,
                searchMonth: new Date(searchDoc.datePerformed).toLocaleString('default', { month: 'long' }),
                titleSize: deedDoc.size + " ha",
                titleCharges: searchDoc.charges,
                searchYear: new Date(searchDoc.datePerformed).getFullYear(),
                searchCounty: deedDoc.county.toUpperCase(),
                image: mapImage,
                titleCoords,
                blockNum: block.blockNum,
                searchNum: searchDoc.searchNum,
                searchDate,
            })
            .render()
    } catch (error) {
        // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
        errorHandler(error);
    }

    var UUID = Date.now()
    var surveyFileName = "SurveyDoc" + UUID
    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    fs.writeFileSync(path.resolve(__dirname, `../public/docs/${surveyFileName}.docx`), buf);
    //convert to pdf   
    await convert(path.resolve(__dirname, `../public/docs/${surveyFileName}.docx`), path.resolve(__dirname, `../public/pdfs/`))
    return surveyFileName
}
async function createSearchDoc(searchDoc, deedDoc, block) {
    //creat docx
    //Load the docx file as a binary
    var content = fs.readFileSync(path.resolve(__dirname, '../public/templates/SearchTemplateVar.docx'), 'binary');
    var zip = new PizZip(content);
    var doc;

    //name Address
    let nameAddress = ""
    for (owner of deedDoc.owners) {
        nameAddress += `${owner.name.toUpperCase()} ID/${owner.idNum} of ${owner.address} `
    }
    // one thousand two hundred thirty-four  
    let searchDate = dateWords[new Date(searchDoc.datePerformed).getDate() - 1]
    //set the templateVariables
    doc = new Docxtemplater().loadZip(zip).setData({
        nameAddress,
        titleNum: deedDoc.titleNum,
        searchMonth: new Date(searchDoc.datePerformed).toLocaleString('default', { month: 'long' }),
        titleSize: deedDoc.size + " ha",
        titleCharges: searchDoc.charges,
        searchYear: new Date(searchDoc.datePerformed).getFullYear(),
        searchCounty: deedDoc.county.toUpperCase(),
        blockNum: block.blockNum,
        searchNum: searchDoc.searchNum,
        searchDate,
    }).render()


    var UUID = Date.now()
    var searchFileName = "SearchDoc" + UUID
    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    fs.writeFileSync(path.resolve(__dirname, `../public/docs/${searchFileName}.docx`), buf);
    //convert to pdf   
    await convert(path.resolve(__dirname, `../public/docs/${searchFileName}.docx`), path.resolve(__dirname, `../public/pdfs/`))
    return searchFileName
}
async function createDeedDoc(deedDoc, block) {
    //creat docx
    //Load the docx file as a binary
    var content = fs.readFileSync(path.resolve(__dirname, '../public/templates/DeedTemplateVar.docx'), 'binary');
    var zip = new PizZip(content);
    var doc;

    //name Address
    let nameAddress = ""
    for (owner of deedDoc.owners) {
        nameAddress += `${owner.name.toUpperCase()} ID/${owner.idNum} of ${owner.address} `
    }

    let titleDate = dateWords[new Date(deedDoc.lastTransferDate).getDate() - 1]
    //set the templateVariables
    doc = new Docxtemplater().loadZip(zip).setData({
        nameAddress,
        titleNum: deedDoc.titleNum,
        titleMonth: new Date(deedDoc.lastTransferDate).toLocaleString('default', { month: 'long' }),
        titleSize: deedDoc.size + " ha",
        titleYear: new Date(deedDoc.lastTransferDate).getFullYear(),
        titleCounty: deedDoc.county.toUpperCase(),
        blockNum: block.blockNum,
        titleDate
    }).render();


    var UUID = Date.now()
    var deedFileName = "TitleDeed" + UUID
    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    fs.writeFileSync(path.resolve(__dirname, `../public/docs/${deedFileName}.docx`), buf);
    //convert to pdf   
    await convert(path.resolve(__dirname, `../public/docs/${deedFileName}.docx`), path.resolve(__dirname, `../public/pdfs/`))
    return deedFileName
}
function convert(inputLocation, outputDir) {
    return new Promise(resolve => {
        var execString = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf ' + inputLocation + " --outdir " + outputDir
        cmd.get(execString, (err, data, stderr) => resolve(err, data, stderr))
    })
}
var dateWords = [
    "first"
    , "second"
    , "third"
    , "fourth"
    , "fifth"
    , "sixth"
    , "seventh"
    , "eighth"
    , "ninth"
    , "tenth"
    , "eleventh"
    , "twelfth"
    , "thirteenth"
    , "fourteenth"
    , "fifteenth"
    , "sixteenth"
    , "seventeenth"
    , "eighteenth"
    , "nineteenth"
    , "twentieth"
    , "twenty-first"
    , "twenty-second"
    , "twenty-third"
    , "twenty-fourth"
    , "twenty-fifth"
    , "twenty-sixth"
    , "twenty-seventh"
    , "twenty-eighth"
    , "twenty-ninth"
    , "thirtieth"
    , "thirty-first"

]
function base64DataURLToArrayBuffer(dataURL) {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) {
        return false;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");
    let binaryString;
    if (typeof window !== "undefined") {
        binaryString = window.atob(stringBase64);
    } else {
        binaryString = Buffer.from(stringBase64, "base64").toString("binary");
    }
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}