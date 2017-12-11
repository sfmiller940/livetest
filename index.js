"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }        = require('./models');

if (process.env.NODE_ENV === 'server') {
  const server   = require('./server');
  server(logs,bots,trades);
}
else{
  bots.wsTicker();
  bots.setWS( require('./conns/ws') );
  var runBots = function(){
    bots.run(trades);
    setTimeout(runBots,5000);
  }
  runBots();
}