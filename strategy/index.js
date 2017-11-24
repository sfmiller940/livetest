"use strict"
const InfiniteLoop   = require('infinite-loop'),
      Poloniex = require('poloniex-api-node');

let poloniex = new Poloniex();

var strategy = function(logs,bots,trades){

  var vwap = function(data){
    var total = 0,
        volume = 0;
    for(var i=0;i<data.length;i++){
      total += data[i].weightedAverage * data[i].volume;
      volume += data[i].volume;
    }
    return total / volume;
  };

  var getChart = function(pair,period,length,end){
    return poloniex.returnChartData(
      pair,
      period,
      end - (length*period),
      end
    )
    .then((chart)=>{ return chart; })
    .catch((err)=>{
      console.log('Failed to load chart: '+err);
      return false;
    });
  };

  var liveBots = [];
  var processTicker = function(ticker){
    bots
      .find({
        active: true,
        pair: ticker.currencyPair,
        strategy: 'bladerunner'
      })
      .exec()
      .then((bots)=>{

        return Promise.all( 
          bots.map((bot)=>{

            if( liveBots.indexOf(bot) != -1 ){
              console.log('live bot!');
              return;
            }
            liveBots.push(bot);

            var now =  Math.floor( (new Date()).getTime() / 1000 );
            var params = JSON.parse( bot.params );
            return getChart(
              bot.pair,
              params.period,
              params.length,
              now
            )
            .then((chart)=>{
                var ave = vwap(chart);
                if(ticker.lowestAsk < ave && 0 != bot.quote ){
                  bot.base += bot.quote * ticker.highestBid;
                  bot.quote = 0;
                  return bot
                    .save()
                    .then((bot) => { 
                      return trades.log({
                          bot:bot,
                          pair:bot.pair,
                          base:bot.base,
                          quote:0,
                          price: ticker.highestBid
                        })
                        .then((trade)=>{
                          liveBots.splice(liveBots.indexOf(bot),1);
                          return;
                        })
                        .catch((err)=>{ console.log('Error saving trade: '+err) });
                    })
                    .catch(()=>{ console.log('Error saving bot: '+err) });
                }
                else if( ave < ticker.highestBid && 0 != bot.base ){
                  bot.quote += bot.base / ticker.lowestAsk;
                  bot.base = 0;
                  return bot
                    .save()
                    .then((bot) => { 
                      return trades.log({
                          bot:bot,
                          pair:bot.pair,
                          base:0,
                          quote:bot.quote,
                          price: ticker.lowestAsk
                        })
                        .then((trade)=>{
                          liveBots.splice(liveBots.indexOf(bot),1);
                          return;
                        })
                        .catch((err)=>{ console.log('Error saving trade: '+err) });
                    })
                    .catch(()=>{ console.log('Error saving bot: '+err) });
                }
                else{
                  liveBots.splice(liveBots.indexOf(bot),1);
                  return;
                }
              }
            )
            .catch((err)=>{
              liveBots.splice(liveBots.indexOf(bot),1);
              console.log('Failed to load chart: '+err);
              return;
            });
          })
        );
      }
    )
    .catch((err)=>{
      console.log('Error getting bots: '+err);
    });
  };

  poloniex.subscribe('ticker');
  poloniex.subscribe('BTC_ETH');
  poloniex.on('open', () => { console.log(`Poloniex WebSocket connection open`); });
  poloniex.on('close', (reason, details) => { logs.log(`Poloniex WebSocket connection disconnected`); });
  poloniex.on('error', (err) => { logs.log(`Websockets error: ` + err);})
  
  poloniex.on('message', (channel, data, seq) => {

    if (channel === 'ticker') {
      processTicker( data );
    }

    if (channel === 'BTC_ETC') {
      console.log(`order book and trade updates received for currency pair ${channel}`);
      console.log(`data sequence number is ${seq}`);
    }
  });
  
  poloniex.openWebSocket({version:2});
}

module.exports = strategy;