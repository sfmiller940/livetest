"use strict"
const models   = require('./models'),
      server = require('./server');

//models.loopBots();
server(models);