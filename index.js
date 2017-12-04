"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }        = require('./models'),
      server   = require('./server');

server(logs,bots,trades);

var runBots = function(){
  bots.run(trades);
  setTimeout(runBots,5000);
}
runBots();