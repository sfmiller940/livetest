"use strict"
const models   = require('./models'),
      bots     = require('./bots'),
      server   = require('./server');

bots.run(models.logs,models.bots,models.trades);
server(models);