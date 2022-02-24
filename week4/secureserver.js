// We need the file system here
var fs = require('fs');

// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Here is the actual HTTP server 
var https = require('https');

// Security options - key and certificate
var options = {
	key: fs.readFileSync('my-key.pem'),
	cert: fs.readFileSync('my-cert.pem')
  };
  
  // We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// We pass in the Express object
//var httpServer = http.createServer(app);

// Listen on port 80
httpServer.listen(443);

// WebSocket Portion
// WebSockets work with the HTTP server
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

var allData = [];

//var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		for (let i = 0; i < allData.length; i++) {
			socket.emit('mouse', allData[i]);

		}
	
		console.log("We have a new client: " + socket.id);
        io.emit('newuser', socket.id);

		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('word', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				//socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				io.emit('word', data);
			}
		);	
		
		socket.on('mouse', 
			// Run this function when a message is sent
			function (data) {
				allData.push(data);
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				//socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				io.emit('mouse', data);
			}
		);	
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}
);