
var redis = require('socket.io-redis');
exports.config = server => {
    global.io = require("socket.io")(server)
    if (process.env.PRODUCTION == 1) {
        io.adapter(redis({ host: process.env.REDIS_ENDPOINT, port: 6379 }));
    } else {
        io.adapter(redis({ host: "localhost", port: 6379 }));
    }
    console.log("configured socket")
    io.on("connection", socket => {
        //join all users rooms
        socket.on("join", async (token, fn) => {
            //join user to rooms           
            socket.join("user" + user._id)
        })
        console.log("SocketController: Socket ID", socket.id)
        socket.emit("welcome", "Hi there")

        console.log("Client connected")
    })
}
