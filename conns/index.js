"use strict"

const Poloniex  = require('poloniex-api-node');
var poloniex = new Poloniex();
var configPolo = function(logs){
  poloniex.on('open', () => { logs.log('Poloniex websocket connected'); });
  poloniex.on('close', (reason, details) => { 
    logs.log('Poloniex websocket disconnected: '+reason); 
    poloniex.openWebSocket({version:2});
  });
  poloniex.on('error', (err) => { logs.log('Websockets error: ' + err);})
  return poloniex;
};
module.exports = configPolo;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 },(listen)=>{
  console.log('WebSockets server running at ws://localhost:8080')
});
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  'configPolo':configPolo,
  'wss':wss
};