require("dotenv").config()
const express = require('express');
const { Kafka } = require('kafkajs')
const ConfirmationController = require("./Controllers/ConfirmationController")
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose")
const crypto = require("crypto")
const fs = require('fs');

//kafka
const kafka = new Kafka({
    clientId: 'master-node',
    brokers: ['localhost:9092']
})
global.producer = kafka.producer()
//private key - feel free to change the PRIVATE KEY
global.GOK_PRIVATE_KEY = fs.readFileSync('./keys/gokPrivate.pem');
//TODO: change username, password and dbname
var connectionString = "mongodb://username:password@localhost/databaseName?authSource=admin"

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const router = require("./router")
const app = express();
//cors
const allowedOrigins = [
    'http://localhost',
    'http://localhost:8080',
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
    credentials: true
}
app.use(cors(corsOptions))
//socket init
const server = require("http").createServer(app)
require("./socket/socket").config(server)


app.use(bodyParser.json());
app.use(router);
app.use(express.static('public'))

const port = 80;
server.listen(port, () => {
    console.log(`listening on ${port}`);
});

async function initChannels() {
    await producer.connect()
    const consumer = kafka.consumer({ groupId: 'application' })
    await consumer.connect()
    await consumer.subscribe({ topic: 'confirmStatus', fromBeginning: true })
    console.log("Started Application Consumer")

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                //output block
                var block = JSON.parse(message.value)
                //pass block to router
                ConfirmationController.confirm(block)
            } catch (ex) {
                console.error(ex)
            }


        },
    })
}
initChannels()