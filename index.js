"use strict"
const models   = require('./models'),
      server = require('./server');

models.runBots();
server(models);