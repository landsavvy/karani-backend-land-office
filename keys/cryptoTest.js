const crypto = require("crypto")
const fs = require('fs');

// See keys/README.md on how to generate this key
const private_key = fs.readFileSync('gokPrivate.pem');
const public_key = fs.readFileSync('gokPublic.pem');

// File/Document to be signed
console.log("private key", private_key)

// Signing
const signer = crypto.createSign('RSA-SHA256');
signer.update("doc");
signer.end();

const signature = signer.sign(private_key, 'base64')

console.log('Digital Signature: ', signature);

const verify = crypto.createVerify('RSA-SHA256');
verify.update('doc');
verify.end();
console.log("verification", verify.verify(public_key, signature, 'base64'));