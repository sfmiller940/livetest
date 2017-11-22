"use strict"
const InfiniteLoop   = require('infinite-loop'),
      Poloniex       = require('poloniex.js');

var ils = {};
var poloniex = new Poloniex();

// Convert to method of log model that returns Error for use with throw.
var log = function(message){
  console.log(message);
  var log = new models.logs({message:message});
  log.save(function(err,message){
    if(err) console.log('Log save error: '+err);
  });
}

var signals = {
  'blade':function(bot){
    return poloniex.returnTicker(function(err,ticker){
      if(err){ log('Unable to get ticker: ' + err); }
      else{
        var now = (new Date()).getTime() / 1000;
        var pair = bot.pair.split('_')
        bot.params = parseJSON( bot.params );
        return poloniex.returnChartDate(
          pair[0],
          pair[1],
          bot.params.period,
          now - (bot.params.length*bot.params.period),
          now,
          function(err,chart){
            if(err){ log('Unable to get chart data: ' + err); }
            else{
              log(ticker);
              log(chart);
              return false;
            }
          }
        );
      }
    });
  }
};

var checkSignal = function(bot){
  if( ! bot.active ){
    ils[bot].stop();
    delete ils[bot];
    return;
  }

  bot.set({
    buy: signals[bot.signal](bot)
  });
  bot.save((err,bot)=>{
    if(err) log( 'Error updating bot: ' + err );
  });
};


var run = function(logs,bots,trades){
  console.log('Running bots...');
  bots
    .find({active:true})
    .sort('created_at')
    .batchSize(100000)
    .exec(function (err, bots) {
      if(err) log('Database error: ' + err);
      else{
        bots.forEach((bot)=>{ 
          if( ! (bot in ils) ){
            il = new InfiniteLoop;
            il.add(checkSignal,[bot]).run();
            ils[bot]=il;
          }
        });
      }
    }
  );
}

module.exports = run();