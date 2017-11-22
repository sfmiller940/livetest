"use strict"
const InfiniteLoop   = require('infinite-loop'),
      Poloniex = require('poloniex-api-node');

let poloniex = new Poloniex();

var strategy = function(logs,bots,trades){

  var liveBots = [];

  function vwap(data){
    var total = 0,
        volume = 0;
    for(var i=0;i<data.length;i++){
      total += data[i].weightedAverage * data[i].volume;
      volume += data[i].volume;
    }
    return total / volume;
  }

  var newTicker = function(ticker){
    bots
      .find({strategy:'bladerunner',active:true})
      .exec(function (err, bots) {
        if(err) logs.log("Error loading bots: "+err);

        bots.forEach(function(bot){
          if( liveBots.indexOf(bot) != -1 ) return;
          if( ticker.currencyPair != bot.pair) return;
          liveBots.push(bot);

          var now =  Math.floor( (new Date()).getTime() / 1000 );
          var params = JSON.parse( bot.params );
          poloniex.returnChartData(
            bot.pair,
            params.period,
            now - (params.length*params.period),
            now,
            function(err,chart){
              if(err){ logs.log('Unable to get chart data: ' + err); }
              else{
                //console.log(ticker.currencyPair);
                //console.log(chart);
                //console.log(vwap(chart));

                if(ticker.last < vwap(chart) ){
                  if(0 < bot.quote){
                    bot.base += bot.quote * ticker.last;
                    bot.quote = 0;
                    bot.save(function(err,message){
                      if(err) logs.log('Error updating bot: '+err);
                    });
                  }
                }
                else if( 0 < bot.base){
                  bot.quote += bot.base / ticker.last;
                  bot.base = 0;
                  bot.save(function(err,message){
                    if(err) logs.log('Error updating bot: '+err);
                  });
                }
                liveBots.splice(liveBots.indexOf(bot),1);
              }
            }
          );
        });
      }
    );
  };

  poloniex.subscribe('ticker');
  poloniex.subscribe('BTC_ETH');
  poloniex.on('open', () => { console.log(`Poloniex WebSocket connection open`); });
  poloniex.on('close', (reason, details) => { console.log(`Poloniex WebSocket connection disconnected`); });
  poloniex.on('error', (err) => { logs.log(`Websockets error: ` + err); ;})
  
  poloniex.on('message', (channel, data, seq) => {
    if (channel === 'ticker') {
      newTicker(data);
    }

    if (channel === 'BTC_ETC') {
      console.log(`order book and trade updates received for currency pair ${channel}`);
      console.log(`data sequence number is ${seq}`);
    }
  });
  
  poloniex.openWebSocket();
}

module.exports = strategy;