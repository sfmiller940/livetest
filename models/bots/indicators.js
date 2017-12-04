"use strict"
const mongoose       = require('mongoose'),
      bittrex  = require('node-bittrex-api'),
      Poloniex = require('poloniex-api-node'),
      logSchema     = require('../logs');

var logs = mongoose.model('logs', logSchema);

var poloniex = new Poloniex(),
    poloTicker = {};
poloniex.subscribe('ticker');
poloniex.on('open', () => { logs.log('Poloniex websocket connected'); });
poloniex.on('close', (reason, details) => { logs.log('Poloniex websocket disconnected: '+reason); });
poloniex.on('error', (err) => { logs.log('Websockets error: ' + err);})
poloniex.on('message', (channel, data, seq) => {
  if (channel === 'ticker') {
    poloTicker[data.currencyPair]=data;
  }
});
poloniex.openWebSocket({version:2});

const indicators = {

  poloniex:poloniex,

  vwap: function(df, len = df.length){
    var total  = 0,
        volume = 0;
    for(var i=(df.length - len);i<df.length;i++){
      total += df[i].weightedAverage * df[i].volume;
      volume += df[i].volume;
    }
    return total / volume;
  },

  getTicker:function(exchange,pair){
    switch(exchange){
      case 'bittrex':
        return bittrex
          .getticker({market:pair})
          .then((ticker)=>{
            return {
              'bid': ticker.Bid,
              'ask': ticker.Ask
            };
          })
          .catch((err)=>{
            throw('Bittrex ticker error: '+err);
          });
      break;
      case 'poloniex':
        if( pair in poloTicker ) return Promise.resolve({
          'bid': poloTicker[pair].highestBid,
          'ask': poloTicker[pair].lowestAsk
        });
        else throw('Ticker not loaded');
      break;
    }
    throw('Ticker error: invalid exchange');
  },

  getChart: function(pair,period,len,end){
    return poloniex.returnChartData(
      pair,
      period,
      end - ((len+1)*period),
      end
    )
    .catch((err)=>{
      throw('Failed to load chart: '+err);
    });
  }
};

module.exports = indicators;