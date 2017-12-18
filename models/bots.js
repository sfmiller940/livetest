"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

var logs,
    trades,
    runningBots = [],
    polo = false,
    broadcast,
    signals,
    poloniex;

var botSchema = new Schema({
  exchange:    String,
  base:        String,
  baseAmt:     Number,
  quote:       String,
  quoteAmt:    Number,
  params:      Object,
  buy:         { type: Boolean, default:false},
  active:      { type: Boolean, default:false},
  created_at:  { type: Date, default: Date.now }
});

botSchema.statics.config = function(_broadcast,_logs,_trades,_poloniex,_signals){
  logs = _logs;
  poloniex = _poloniex;
  trades = _trades;
  broadcast = _broadcast;
  signals = _signals;
  poloniex.on('open', () => { polo=true; });
  poloniex.on('close', () => { polo=false; });
};

botSchema.methods.pair = function(){
  return ( 
    this.exchange == 'poloniex' ? this.base + '_' + this.quote : (
      this.exchange == 'bittrex' ? this.base + '-' + this.quote : false
    )
  );
};

botSchema.methods.run = function(){
  return signals
    .signals[this.params.signal](this)
    .then((signal)=>{
      if(this.buy!=signal){
        this.buy = signal;
        this
          .save()
          .catch((err)=>{console.log('Failed to save signal: '+err);});
      }
    });
};

botSchema.statics.run = function(){
  if(!polo) return;
  this
    .find({active:true})
    .exec()
    .then((bots)=>{
      bots.forEach((bot)=>{
        if(-1 != runningBots.indexOf(bot)) return;
        runningBots.push(bot);
        bot
          .run()
          .then((trade)=>{
            runningBots.splice(runningBots.indexOf(bot),1);
          })
          .catch((err)=>{ logs.log('Error running bot: '+err); });
      }); 
    })
    .catch((err)=>{ logs.log('Error finding bots: '+err); });
  broadcast({'botsRan': new Date().toLocaleString()});
};

module.exports = botSchema;