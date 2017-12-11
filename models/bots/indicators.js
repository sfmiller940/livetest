"use strict"
const mongoose  = require('mongoose'),
      bittrex   = require('node-bittrex-api'),
      Poloniex  = require('poloniex-api-node'),
      logSchema = require('../logs'),
      logs      = mongoose.model('logs', logSchema);

var poloniex = new Poloniex(),
    poloTicker = {},
    charts = {};

const indicators = {

  wsTicker: function(){
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
    return poloniex;
  },

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

  getChart: function(bot,len){
    var pair = bot.pair(),
        period = bot.params.period,
        now = Math.floor( (new Date()).getTime() / 1000 );
    if(
      pair in charts
      && bot.params.period in charts[pair]
      && len <= charts[pair][period].length 
      && ( (now-period-60) < (new Date( charts[pair][period].slice(-1)[0].date )).getTime() )
    ) return Promise.resolve(charts[pair][period].slice(-len));

    return poloniex.returnChartData(
      pair,
      period,
      now - ((len+10)*period), // Huge lag!
      now
    )
    .then((chart)=>{
      if( chart.length < len) throw('Chart too short');
      if(!(pair in charts)) charts[pair]={};
      charts[pair][period] = chart;
      return chart.slice(-len);
    })
    .catch((err)=>{
      throw('Failed to load chart: '+err);
    });
  }
};

module.exports = indicators;