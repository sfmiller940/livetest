"use strict"
const bittrex = require('node-bittrex-api');

var poloniex,
    poloTicker = {},
    charts = {};

var config = function(_poloniex){
  poloniex=_poloniex;
  poloniex.subscribe('ticker');
  poloniex.on('message', (channel, data, seq) => {
    if (channel === 'ticker') {
      poloTicker[data.currencyPair]=data;
    }
  });
};

var vwap = function (df, len = df.length){
  var total  = 0,
      volume = 0;
  for(var i=(df.length - len);i<df.length;i++){
    total += df[i].weightedAverage * df[i].volume;
    volume += df[i].volume;
  }
  return total / volume;
};

var getTicker = function(exchange,pair){
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
};

var getChart = function(bot,len,delta=10){
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
    now - ((len+delta)*period), // Huge lag!
    now
  )
  .then((chart)=>{
    if( chart.length < len) return getChart(bot,len,delta*2);

    if(!(pair in charts)) charts[pair]={};
    charts[pair][period] = chart;
    return chart.slice(-len);
  })
  .catch((err)=>{
    throw('Failed to load chart: '+err);
  });
}

var signals = {
  'bladerunner':function(bot){
    return Promise
      .all([
        getTicker(bot.exchange,bot.pair()),
        getChart(bot,bot.params.len)
      ])
      .then(([ticker,chart])=>{
        if( (! ticker) || (! chart) ) return false;
        return vwap(chart,bot.params.len) < (ticker.ask/2 + ticker.bid/2);
      })
      .catch((err)=>{ throw('Bladerunner error: '+err); });
  },
  'macd1':function(bot){
    return getChart(bot,bot.params.window2)
      .then((chart)=>{
        return vwap(chart,bot.params.window2) < vwap(chart,bot.params.window1);
      })
      .catch((err)=>{throw( 'Macd1 error: '+err);});
  },
  'macd2':function(bot){
    return getChart(bot,bot.params.window2 + bot.params.len)
      .then((chart)=>{
        var ave=0;
        for(var i=0;i<bot.params.len;i++){
          ave += vwap(chart.slice(0,bot.params.window2+i),bot.params.window2) - vwap(chart.slice(0,bot.params.window2+1),bot.params.window1);
        }
        return (ave/bot.params.len) < (vwap(chart,bot.params.window2) - vwap(chart,bot.params.window1));
      })
      .catch((err)=>{throw( 'Macd2 error: '+err);});
  }
};

module.exports = {
  config:config,
  getTicker:getTicker,
  signals:signals
};