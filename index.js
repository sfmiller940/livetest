"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }          = require('./models'),
      server     = require('./server'),
      conns      = require('./conns'),
      signals    = require('./signals');

logs.config(conns.wss.broadcast);

server(logs,bots,trades,conns.wss);

var poloniex = conns.configPolo(logs);

signals.config(poloniex);
bots.config(conns.wss.broadcast,logs,trades,poloniex,signals);
trades.config(conns.wss.broadcast,bots,logs,signals);

poloniex.openWebSocket({version:2});

setInterval(()=>{
  bots.run(trades);
},6000);

setInterval(()=>{
  trades.run(trades);
},12000);
