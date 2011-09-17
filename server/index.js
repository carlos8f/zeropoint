var express = require('express'),
    app = require('../app'),
    _ = require('underscore'),
    io = require('socket.io').listen(app);

var clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  var object = {type: 'ship', id: socket.id};
  socket.emit('me', socket.id);
  for (var i in clients) {
    clients[i].emit('create', object);
  }
});

io.sockets.on('disconnect', function (socket) {
  var new_clients = [];
  for (var i in clients) {
    if (clients[i].id != socket.id) {
      new_clients.push(clients[i]);
    }
  }
  clients = new_clients;
  var object = {type: 'ship', id: socket.id};
  for (var j in clients) {
    clients[j].emit('destroy', object);
  }
});

// Send snapshots 10x/sec.
setInterval(function() {
  // Generate snapshot.
  /*
  var snapshot = {ts: new Date().getTime(), data: []};
  _.each(clients, function() {
    snapshot.data.push({x: Math.random(), y: Math.random()});
  });

  // Send to each client.
  _.each(clients, function(client) {
    client.emit('snapshot', snapshot);
  });
  */
}, 1000 / 10);