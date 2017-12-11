"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema,
      indic          = require('./indicators'),
      logSchema      = require('../logs');

var logs = mongoose.model('logs', logSchema),
    runningBots = [],
    polo = false,
    broadcast;

var botSchema = new Schema({
  exchange:    String,
  base:        String,
  baseAmt:     Number,
  quote:       String,
  quoteAmt:    Number,
  params:      Object,
  active:      { type: Boolean, default:false},
  created_at:  { type: Date, default: Date.now }
});

botSchema.methods.pair = function(){
  return ( 
    this.exchange == 'poloniex' ? this.base + '_' + this.quote : (
      this.exchange == 'bittrex' ? this.base + '-' + this.quote : false
    )
  );
};

var signals = {
  'bladerunner':function(bot){
    return Promise
      .all([
        indic.getTicker(bot.exchange,bot.pair()),
        indic.getChart(bot,bot.params.len)
      ])
      .then(([ticker,chart])=>{
        if( (! ticker) || (! chart) ) return false;
        return indic.vwap(chart,bot.params.len) < (ticker.ask/2 + ticker.bid/2);
      })
      .catch((err)=>{ throw('Bladerunner error: '+err); });
  },
  'macd1':function(bot){
    return indic
      .getChart(bot,bot.params.window2)
      .then((chart)=>{
        return indic.vwap(chart,bot.params.window2) < indic.vwap(chart,bot.params.window1);
      })
      .catch((err)=>{throw( 'Macd1 error: '+err);});
  },
  'macd2':function(bot){
    return indic
      .getChart(bot,bot.params.window2 + bot.params.len)
      .then((chart)=>{
        var ave=0;
        for(var i=0;i<bot.params.len;i++){
          ave += indic.vwap(chart.slice(0,bot.params.window2+i),bot.params.window2) - indic.vwap(chart.slice(0,bot.params.window2+1),bot.params.window1);
        }
        return (ave/bot.params.len) < (indic.vwap(chart,bot.params.window2) - indic.vwap(chart,bot.params.window1));
      })
      .catch((err)=>{throw( 'Macd2 error: '+err);});
  }
}

botSchema.methods.trade = function(trades){
  return indic
    .getTicker(this.exchange,this.pair())
    .then((ticker)=>{
      if( ! ticker ) return false;
      var price = ticker.bid/2 + ticker.ask/2;
      if( this.baseAmt != 0 ){
        this.quoteAmt += this.baseAmt / price;
        this.baseAmt = 0;
      }
      else{
        this.baseAmt += this.quoteAmt * price;
        this.quoteAmt = 0;
      }
      return this.save()
        .then((bot) => {
          return trades.log({
            bot:this,
            baseAmt:this.baseAmt,
            quoteAmt:this.quoteAmt,
            price: price
          })
          .then((trade)=>{
            broadcast({'trade':trade});
            return Promise.resolve(trade);
          })
          .catch((err)=>{ throw('Error saving trade: '+err) });
        })
        .catch((err)=>{ throw('Error saving bot: '+err) });
    })
    .catch((err)=>{ throw('Ticker failure: '+err); });
};

botSchema.methods.run = function(trades){
  return signals[this.params.signal](this)
    .then((signal)=>{
      if(  ( signal && 0 != this.baseAmt )
        || ( (! signal) && 0 != this.quoteAmt )
      ) return this.trade(trades);
      return false;
    });
};

botSchema.statics.run = function(trades){
  if(!polo) return;
  this.find({active:true}).exec()
    .then((bots)=>{
      bots.forEach((bot)=>{
        if(-1 != runningBots.indexOf(bot)) return;3
        runningBots.push(bot);
        bot.run(trades)
          .then((trade)=>{
            runningBots.splice(runningBots.indexOf(bot),1);
          })
          .catch((err)=>{ logs.log('Error running bot: '+err); });
      }); 
    })
    .catch((err)=>{ logs.log('Error finding bots: '+err); });
  console.log( (new Date().toLocaleString()) + ' running bots');
};

botSchema.statics.wsTicker = function(){
  var poloniex = indic.wsTicker();
  poloniex.on('open', () => { polo=true; });
  poloniex.on('close', () => {
    polo=false;
    poloniex.openWebSocket({version:2});
  });
};

botSchema.statics.setWS = function(ws){ 
  broadcast = ws;
  logs.setWS(ws);
};

module.exports = botSchema;