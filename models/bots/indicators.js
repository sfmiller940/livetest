"use strict"
const bittrex  = require('node-bittrex-api'),
      Poloniex = require('poloniex-api-node');

var poloniex = new Poloniex(),
    poloTicker = {};
poloniex.subscribe('ticker');
poloniex.on('open', () => { console.log(`Poloniex WebSocket connection open`); });
poloniex.on('close', (reason, details) => { logs.log(`Poloniex WebSocket connection disconnected`); });
poloniex.on('error', (err) => { logs.log(`Websockets error: ` + err);})
poloniex.on('message', (channel, data, seq) => {
  if (channel === 'ticker') {
    poloTicker[data.currencyPair]=data;
  }
});
poloniex.openWebSocket({version:2});

const indicators = {

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
            console.log('Bittrex ticker error: '+err);
            return false;
          });
      break;
      case 'poloniex':
        if( pair in poloTicker ) return Promise.resolve({
          'bid': poloTicker[pair].highestBid,
          'ask': poloTicker[pair].lowestAsk
        });
      break;
    }
    return Promise.resolve(false);
  },

  getChart: function(pair,period,len,end){
    return poloniex.returnChartData(
      pair,
      period,
      end - (len*period),
      end
    )
    .catch((err)=>{
      console.log('Failed to load chart: '+err);
      return false;
    });
  }
};

module.exports = indicators;