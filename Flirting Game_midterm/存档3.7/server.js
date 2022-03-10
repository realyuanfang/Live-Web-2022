var fs = require('fs');

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.send('Hello World!')
});

var https = require('https');

var options = {
    key: fs.readFileSync('my-key.pem'),
    cert: fs.readFileSync('my-cert.pem')
};

var httpServer = https.createServer(options, app);
httpServer.listen(8019);

let peers = [];

const { Server } = require('socket.io');
const io = new Server(httpServer, {});

io.sockets.on('connection', function (socket) {

    peers.push({ socket: socket });
    console.log("New user connected, with id:" + socket.id);
    // io.emit('newuser', socket.id);

    // socket.on('list', function () {
    //     let ids = [];
    //     for (let i = 0; i < peers.length; i++) {
    //         ids.push(peers[i].socket.id);
    //     }
    //     console.log("ids length: " + ids.length);
    //     socket.emit('listresults', ids);
    // });

    // Relay signals back and forth
    // socket.on('signal', (to, from, data) => {
    //     console.log("SIGNAL", to, data);
    //     let found = false;
    //     for (let i = 0; i < peers.length; i++) {
    //         console.log(peers[i].socket.id, to);
    //         if (peers[i].socket.id == to) {
    //             console.log("Found Peer, sending signal");
    //             peers[i].socket.emit('signal', to, from, data);
    //             found = true;
    //             break;
    //         }
    //     }
    //     if (!found) {
    //         console.log("never found peer");
    //     }
    // });

    socket.on('otherevent', function (data) {
        console.log("Received: 'otherevent' " + data);
        io.emit('otherevent', data);
    });

    socket.on('replaysend', function(data) {
        console.log("Received: 'replaysend' " + data);
        io.emit('replaysend', data);
    });

    socket.on('disconnect', function () {
        console.log("Client has disconnected " + socket.id);
        io.emit('peer_disconnect', socket.id);
        for (let i = 0; i < peers.length; i++) {
            if (peers[i].socket.id == socket.id) {
                peers.splice(i, 1);
            }
        }
    });

}
);