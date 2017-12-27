"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

var logs,
    polo = false,
    broadcast,
    signals,
    poloniex,
    botPause=200;

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

botSchema.statics.config = function(_broadcast,_logs,_poloniex,_signals){
  logs = _logs;
  poloniex = _poloniex;
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
    .catch(err=>{throw('Error getting signal: '+err);})
    .then((signal)=>{
      if(this.buy!=signal){
        this.buy = signal;
        return this
          .save()
          .catch((err)=>{throw('Failed to save signal: '+err);});
      }
      return signal;
    })
    .catch(err=>{throw('Error processing signal: '+err);});
};

function delay(t) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, t)
   });
}

botSchema.statics.run = function(){
  if(!polo) return delay(botPause);
  return this
    .find({active:true})
    .exec()
    .then((bots)=>{
      return Promise.all(
        bots.map((bot,ind)=>{
          return delay(botPause*ind).then(()=>{
            return bot
              .run()
              .catch((err)=>{ logs.log('Error running bot: '+err); });
          });
        })
      )
      .then(results=>{ broadcast({'botsRan': new Date().toLocaleString()}); })
      .catch(err=>{throw('Error running bots: '+err);});
    })
    .catch((err)=>{ logs.log('Error finding bots: '+err); });
};

module.exports = botSchema;