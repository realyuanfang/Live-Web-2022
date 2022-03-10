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
httpServer.listen(8022);

let peers = [];
let players = {};

const { Server } = require('socket.io');
const io = new Server(httpServer, {});

io.sockets.on('connection', function (socket) {

    peers.push({ socket: socket });

    socket.on('newPlayer', data => {
        console.log("New user connected, with id:" + socket.id);
        players[socket.id] = data;
        console.log("starting position: " + players[socket.id].x + " - " + players[socket.id].y);
        console.log("Current number of players: " + Object.keys(players).length);
        io.emit('updatePlayers', players);
    });


    socket.on('startGameSend', function() {
        console.log("Received: 'startGameSend' send");
        io.emit('startGameSend', "sendback");
    });

    socket.on('otherevent', function (data) {
        console.log("Received: 'otherevent' " + data);
        io.emit('otherevent', data);
    });

    socket.on('replaysend', function() {
        console.log("Received: 'replaysend' send");
        io.emit('replaysend', "sendback");
    });

    socket.on('player1graphics', function(data) {
        io.emit('player1graphics', data);
    });
    socket.on('player2graphics', function(data) {
        io.emit('player2graphics', data);
    });



    socket.on('disconnect', function () {
        console.log("Client has disconnected " + socket.id);
        io.emit('peer_disconnect', socket.id);
        for (let i = 0; i < peers.length; i++) {
            if (peers[i].socket.id == socket.id) {
                peers.splice(i, 1);
            }
        }
        console.log("Goodbye client with id " + socket.id);
        console.log("Current number of players: " + Object.keys(players).length);
        io.emit('updatePlayers', players);
    });

}
);