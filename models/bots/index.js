"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema,
      indic          = require('./indicators');

var logs,
    trades,
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

botSchema.statics.config = function(_broadcast,_logs,_trades,poloniex){
  logs = _logs;
  trades = _trades;
  broadcast = _broadcast;
  poloniex.on('open', () => { polo=true; });
  poloniex.on('close', () => { polo=false; });
  indic.config(poloniex);
};

botSchema.methods.pair = function(){
  return ( 
    this.exchange == 'poloniex' ? this.base + '_' + this.quote : (
      this.exchange == 'bittrex' ? this.base + '-' + this.quote : false
    )
  );
};

botSchema.methods.trade = function(){
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

botSchema.methods.run = function(){
  return indic.signals[this.params.signal](this)
    .then((signal)=>{
      if(  ( signal && 0 != this.baseAmt )
        || ( (! signal) && 0 != this.quoteAmt )
      ) return this.trade();
      return false;
    });
};

botSchema.statics.run = function(){
  if(!polo) return;
  this.find({active:true}).exec()
    .then((bots)=>{
      bots.forEach((bot)=>{
        if(-1 != runningBots.indexOf(bot)) return;3
        runningBots.push(bot);
        bot.run()
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