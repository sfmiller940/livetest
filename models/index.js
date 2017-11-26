"use strict"
const mongoose   = require('mongoose'),
      logs       = require('./logs'),
      bots       = require('./bots'),
      trades     = require('./trades');

mongoose.Promise = global.Promise;

mongoose
  .connect('mongodb://localhost:27017/livetest',{useMongoClient: true})
  .catch((err)=>{ console.log('Mongodb connections failure: '+err); });

module.exports = {
  logs: mongoose.model('logs', logs),
  bots: mongoose.model('bots', bots),
  trades: mongoose.model('trades', trades),
};