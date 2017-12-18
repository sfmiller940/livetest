"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

var bots,
    broadcast,
    logs,
    runningBots = [],
    signals;

var tradeSchema = new Schema({
  bot:         [{ type: Schema.Types.ObjectId, ref: 'bots' }],
  baseAmt:     Number,
  quoteAmt:    Number,
  price:       Number,
  created_at:  { type: Date, default: Date.now }
});

tradeSchema.statics.log = function(trade) {
  return this
    .create(trade)
    .then((trade)=>{
      console.log('New trade: ');
      console.log(trade);
      return trade;
    })
    .catch((err)=>{ console.log('Trade save error: '+err); });
}

tradeSchema.statics.config = function(_broadcast, _bots,_logs,_signals){
  bots = _bots;
  broadcast = _broadcast;
  logs = _logs;
  signals = _signals;
};

tradeSchema.statics.run = function(){
  bots
    .find({active:true})
    .exec()
    .then((bots)=>{
      bots.forEach((bot)=>{
        if(-1 != runningBots.indexOf(bot)) return;
        runningBots.push(bot);
        this.tradeBot(bot)
          .then((trade)=>{
            runningBots.splice(runningBots.indexOf(bot),1);
          })
          .catch((err)=>{ logs.log('Error trading bot: '+err); });
      }); 
    })
    .catch((err)=>{ logs.log('Error finding bots: '+err); });
};

tradeSchema.statics.tradeBot = function (bot){
  return signals
    .getTicker(bot.exchange,bot.pair())
    .then((ticker)=>{
      var price = ticker.bid/2 + ticker.ask/2;
      if( bot.buy && bot.baseAmt != 0 ){
        bot.quoteAmt += bot.baseAmt / price;
        bot.baseAmt = 0;
      }
      else if( (!bot.buy) && bot.quoteAmt != 0 ){
        bot.baseAmt += bot.quoteAmt * price;
        bot.quoteAmt = 0;
      }
      else{ return; }
      return bot
        .save()
        .then((bot) => {
          return this.log({
            bot:bot,
            baseAmt:bot.baseAmt,
            quoteAmt:bot.quoteAmt,
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
    .catch((err)=>{ throw('Error getting ticker: '+err); });
};

module.exports = tradeSchema;