const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 },(listen)=>{
  console.log('WS listening on port 8080.')
});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = wss.broadcast;