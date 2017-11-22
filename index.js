"use strict"
const { logs:logs,
        bots:bots,
        trades:trades
      }        = require('./models'),
      strategy = require('./strategy'),
      server   = require('./server');

strategy(logs,bots,trades);
server(logs,bots,trades);