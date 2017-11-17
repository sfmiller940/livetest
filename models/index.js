"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema,
      InfiniteLoop   = require('infinite-loop'),
      il             = new InfiniteLoop,
      request        = require('request');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/livetest');

var logsSchema = new Schema({
  message:        String,
  created_at:     Date
});

var botsSchema = new Schema({
  pair:        String,
  signal:      String,
  params:      Object,
  base:        Number,
  quote:       Number,
  active:      Boolean,
  created_at:  Date
});

var tradesSchema = new Schema({
  bot:         [{ type: Schema.Types.ObjectId, ref: 'bots' }],
  pair:        String,
  buy:         Boolean,
  quote:       Number,
  price:       Number,
  created_at:  Date
});

var signals = {
  blade: function(bot){
  }
};

var loopBots = function(){
}

var models = {
  logs: mongoose.model('logs', logsSchema),
  bots: mongoose.model('bots', botsSchema),
  trades: mongoose.model('trades', tradesSchema),

  runBots: function(){
    console.log('Running bots...');
    il.add(loopBots,[]).run();
  }
};

module.exports = models;

