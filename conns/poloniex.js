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
