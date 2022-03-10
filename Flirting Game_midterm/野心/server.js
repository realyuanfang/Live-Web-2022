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
httpServer.listen(8021);

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

    let playerIndex = -1;

    for (const i in connections) {
        if (connections[i] === null) {
            playerIndex = i
            break
        }
    }
    if (playerIndex === -1) return
    connections[playerIndex] = false
    socket.broadcast.emit('player-connection', playerIndex);

    socket.emit('player-number', playerIndex);
    console.log(`Player ${playerIndex} has connected`);

    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    socket.on('check-players', () => {
        const players = []
        for (const i in connections) {
            connections[i] === null ? players.push({ connected: false, ready: false }) : players.push({ connected: true, ready: connections[i] })
        }
        socket.emit('check-players', players)
    });

    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id)
        socket.broadcast.emit('fire', id)
    });

    socket.on('fire-reply', square => {
        console.log(square)
        socket.broadcast.emit('fire-reply', square)
    });

    socket.on('startGameSend', function () {
        console.log("Received: 'startGameSend' send");
        io.emit('startGameSend', "sendback");
    });

    socket.on('otherevent', function (data) {
        console.log("Received: 'otherevent' " + data);
        io.emit('otherevent', data);
    });

    socket.on('replaysend', function () {
        console.log("Received: 'replaysend' send");
        io.emit('replaysend', "sendback");
    });

    socket.on('player1graphics', function (data) {
        io.emit('player1graphics', data);
    });
    socket.on('player2graphics', function (data) {
        io.emit('player2graphics', data);
    });



    socket.on('disconnect', function () {
        console.log("Client has disconnected " + socket.id);
        console.log(`Player ${playerIndex} disconnected`);
        connections[playerIndex] = null;
        socket.broadcast.emit('player-connection', playerIndex);
        // io.emit('peer_disconnect', socket.id);
        // for (let i = 0; i < peers.length; i++) {
        //     if (peers[i].socket.id == socket.id) {
        //         peers.splice(i, 1);
        //     }
        // }
    });

}
);