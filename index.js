"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }          = require('./models'),
      server     = require('./server'),
      wss        = require('./conns/localWS'),
      configPolo = require('./conns/poloniex.js');

logs.config(wss.broadcast);

server(logs,bots,trades,wss);

var poloniex = configPolo(logs);
bots.config(wss.broadcast,logs,trades,poloniex);
poloniex.openWebSocket({version:2});
setInterval(()=>{
  bots.run(trades);
},5000);
