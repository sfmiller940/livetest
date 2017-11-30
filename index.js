"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }        = require('./models'),
      server   = require('./server');

server(logs,bots,trades);

var runningBots = [];
var runBots = function(){
  bots.run(trades,runningBots);
  setTimeout(runBots,3000);
}
runBots();