var express = require("express"),
    BinaryServer = require('binaryjs').BinaryServer,
    fs = require('fs');
  
var port = process.env.PORT || process.env.VMC_APP_PORT || 8080;

var app = express(), 
    server = require('http').createServer(app),
    bs = BinaryServer({server : server});

// Wait for new user connections
bs.on('connection', function (client){
  // Define streams we must push to
  var clientStreams = [];
  // Incoming stream from a client
  client.on('stream', function (stream, meta){
    // Find all connected clients
    var clients = bs.clients;
    // Create a stream for each clients
    for(i in clients){
      // Dont send data to the broadcaster and dont create a new stream if already exists
      if(client!=clients[i] && Object.keys(clients[i].streams).length == 0){
        clientStreams.push(clients[i].createStream({clientId : clients[i].id}));
      } 
    }
    // Push data to clients
    for(i in clientStreams){
      stream.pipe(clientStreams[i]);
    }
    
    stream.on('open', function (stream){
      console.log(stream);
    });
    stream.on('end', function (){
      console.log("stream is received 100% on server")
      //client.close();
    });
  });
});

server.listen(port);

app.set('view engine', 'ejs');
app.set("view options", {layout: false});
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});
app.get('/', function(req, res){
  res.render('index', {})
});
console.log('Listening on port '+port);