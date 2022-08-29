const TitleSearch = require("../Models/TitleSearch")
const Common = require("./Common")
var Docxtemplater = require('docxtemplater');
//Node.js example
var ImageModule = require('docxtemplater-image-module');
var fs = require('fs');
var path = require('path');
var PizZip = require('pizzip');
var T2W = require('numbers2words');
var cmd = require('node-cmd');
const axios = require('axios');
const { exec } = require("child_process");
// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
var opts = {}
opts.centered = false; //Set to true to always center images
opts.fileType = "docx"; //Or pptx

//Pass your image loader
opts.getImage = function (tagValue) {
    // return fs.readFileSync(tagValue);
    return tagValue
}

//Pass the function that return image size
opts.getSize = function (img, tagValue, tagName) {
    //img is the image returned by opts.getImage()
    //tagValue is 'examples/image.png'
    //tagName is 'image'
    //tip: you can use node module 'image-size' here
    return [900, 900];
}

async function test() {
    var imageModule = new ImageModule(opts);
    var content = fs.readFileSync(path.resolve(__dirname, '../public/templates/SurveyTemplateVar.docx'), 'binary');
    var zip = new PizZip(content);
    var doc;

    let mapImage = await axios
        .get("", {
            responseType: 'arraybuffer',
        })
    let mapImage2 = fs.readFileSync(path.resolve(__dirname, "./image.png"));
    let mapImage3 = path.resolve(__dirname, "./image.png");
    let mapImage4 = "./image.png"

    doc = new Docxtemplater().attachModule(imageModule)
        .loadZip(zip)
        .setData({ image: mapImage.data })
        .render();


    try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        //doc.render()
    }
    catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
        console.error(error);
    }

    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    fs.writeFileSync(path.resolve(__dirname, `../public/docs/survey.docx`), buf);
    //convert to pdf  

}

test()