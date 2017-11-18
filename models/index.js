"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema,
      InfiniteLoop   = require('infinite-loop'),
      il             = new InfiniteLoop,
      request        = require('request'),
      Poloniex       = require('poloniex.js');

var poloniex = new Poloniex();

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/livetest');

var logSchema = new Schema({
  message:        String,
  created_at:     { type: Date, default: Date.now }
});

var botSchema = new Schema({
  pair:        String,
  signal:      String,
  params:      String,
  base:        Number,
  quote:       Number,
  active:      Boolean,
  created_at:  { type: Date, default: Date.now }
});

var tradeSchema = new Schema({
  bot:         [{ type: Schema.Types.ObjectId, ref: 'bots' }],
  pair:        String,
  buy:         Boolean,
  quote:       Number,
  price:       Number,
  created_at:  { type: Date, default: Date.now }
});

var signals = {'blade':function(bot){}};

var log = function(message){
  console.log(message);
  /*var log = new models['logs']({message:message});
  log.save(function(err,message){
    if(err) console.log('Log save error: '+err);
  });*/
}

var runBots = function(){
  models['bots']
    .find({})
    .sort('created_at')
    .batchSize(100000)
    .exec(function (err, bots) {
      if(err) log('Database error: ' + err);
      else{
        bots.forEach((bot)=>{ bot.run(); });
      }
    }
  );
}

botSchema.methods.run = function(){
  if( ! this.active ) return;
  return poloniex.returnTicker(function(err,data){
    if(err){ log('Unable to get ticker: ' + err); }
    else{
      var now = (new Date()).getTime() / 1000;
      var pair = this['pair'].split('_')
      return poloniex.returnChartDate(
        pair[0],
        pair[1],
        this['params']['period'],
        now - (this['params']['length']*this['params']['period']),
        now,
        function(err,data){
          if(err){ log('Unable to get chart data: ' + err); }
          else{
            log('yay!')
          }
        }
      );
    }
  });
}

var models = {
  logs: mongoose.model('logs', logSchema),
  bots: mongoose.model('bots', botSchema),
  trades: mongoose.model('trades', tradeSchema),

  loopBots: function(){
    console.log('Running bots...');
    il
      .add(runBots,[])
      .run();
  }
};

module.exports = models;