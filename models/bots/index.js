"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema,
      indic          = require('./indicators'),
      logSchema      = require('../logs');

var logs = mongoose.model('logs', logSchema);

var botSchema = new Schema({
  exchange:    String,
  base:        String,
  baseAmt:     Number,
  quote:       String,
  quoteAmt:    Number,
  signal:      String,
  params:      String,
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
  'bladerunner':function(bot,params){
    return Promise
      .all([
        indic.getTicker(bot.exchange,bot.pair()),
        indic.getChart(bot.pair(),params.period,params.len,params.now)
      ])
      .then(([ticker,chart])=>{
        if( (! ticker) || (! chart) ) return false;
        return indic.vwap(chart,params.len) < (ticker.ask/2 + ticker.bid/2);
      })
      .catch((err)=>{ logs.log('Bladerunner error: '+err); });
  },
  'macd1':function(bot,params){
    return indic
      .getChart(bot.pair(),params.period,params.window2,params.now)
      .then((chart)=>{
        return indic.vwap(chart,params.window2) < indic.vwap(chart,params.window1);
      })
      .catch((err)=>{logs.log( 'Macd1 error: '+err);});
  },
  'macd2':function(bot,params){
    return indic
      .getChart(bot.pair(),params.period,params.window2 + params.len,params.now)
      .then((chart)=>{
        var ave=0;
        for(var i=0;i<params.len;i++){
          ave += indic.vwap(chart.slice(0,params.window2+i),params.window2) - indic.vwap(chart.slice(0,params.window2+1),params.window1);
        }
        return (ave/params.len) < (indic.vwap(chart,params.window2) - indic.vwap(chart,params.window1));
      })
      .catch((err)=>{logs.log( 'Macd2 error: '+err);});
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
          .catch((err)=>{ logs.log('Error saving trade: '+err) });
        })
        .catch((err)=>{ logs.log('Error saving bot: '+err) });
    })
    .catch((err)=>{ logs.log('Ticker failure: '+err); });
};

botSchema.methods.run = function(trades){
  var params = JSON.parse(this.params);
  params['now'] = Math.floor( (new Date()).getTime() / 1000 );
  return signals[this.signal](this,params)
    .then((signal)=>{
      if(  ( signal && 0 != this.baseAmt )
        || ( (! signal) && 0 != this.quoteAmt )
      ) return this.trade(trades);
      return false;
    });
};

botSchema.statics.run = function(trades,runningBots){
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

module.exports = botSchema;