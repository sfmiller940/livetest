"use strict"
const InfiniteLoop   = require('infinite-loop'),
      Poloniex = require('poloniex-api-node');

let poloniex = new Poloniex();

var strategy = function(logs,bots,trades){

  var liveBots = [];

  var newTicker = function(ticker){
    bots
      .find({strategy:'bladerunner',active:true})
      .exec(function (err, bots) {
        if(err) logs.log("Error loading bots: "+err);

        bots.forEach(function(bot){
          if( liveBots.indexOf(bot) != -1 ) return;
          liveBots.push(bot);

          var now =  Math.floor( (new Date()).getTime() / 1000 );
          var params = JSON.parse( bot.params );
          return poloniex.returnChartData(
            bot.pair,
            params.period,
            now - (params.length*params.period),
            now,
            function(err,chart){
              if(err){ logs.log('Unable to get chart data: ' + err); }
              else{
                console.log(ticker);
                //console.log(chart);
                liveBots.splice(liveBots.indexOf(bot),1);
                return;
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