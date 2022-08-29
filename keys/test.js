
const crypto = require("crypto")
const fs = require("fs")
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});
// Handle errors and use the generated key pair.
var pubKey = publicKey.export({ type: "pkcs1", format: "pem" })
var privKey = privateKey.export({ type: "pkcs1", format: "pem" })
console.log(pubKey)
console.log(privKey)

fs.writeFileSync("testPrivate.pem", privKey)
fs.writeFileSync("testPublic.pem", pubKey)
console.log("done")