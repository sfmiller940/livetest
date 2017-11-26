"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }        = require('./models'),
      server   = require('./server');

server(logs,bots,trades);

var liveBots = [];
var runBots = function(){
  bots.run(logs,trades,liveBots);
  setTimeout(runBots,3000);
}
runBots();