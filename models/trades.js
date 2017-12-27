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

tradeSchema.statics.config = function(_broadcast, _bots,_logs,_signals){
  bots = _bots;
  broadcast = _broadcast;
  logs = _logs;
  signals = _signals;
};

tradeSchema.statics.tradeBot = function (bot){
  if( (bot.buy && bot.baseAmt == 0) || ( (!bot.buy) && bot.quoteAmt==0 ) ) return Promise.resolve(true);
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
      return bot
        .save()
        .then((bot) => {
          return this
            .create({
              bot:bot,
              baseAmt:bot.baseAmt,
              quoteAmt:bot.quoteAmt,
              price: price
            })
            .then(trade=>{
              broadcast({'trade':trade});
              return trade;
            })
            .catch(err=>{ throw('Error saving trade: '+err) });
        })
        .catch(err=>{ throw('Error saving bot: '+err) });
    })
    .catch(err=>{ throw('Error getting ticker: '+err); });
};

tradeSchema.statics.run = function(){
  return bots
    .find({active:true})
    .exec()
    .catch(err=>{ logs.log('Error finding trading bots: '+err); })
    .then((bots)=>{
      return Promise.all(
        bots.map((bot)=>{
          if(-1 != runningBots.indexOf(bot)) return;
          runningBots.push(bot);
          return this
            .tradeBot(bot)
            .then((trade)=>{
              runningBots.splice(runningBots.indexOf(bot),1);
            })
            .catch(err=>{ logs.log('Error running trading bot: '+err); });
        })
      );
    })
    .catch(err=>{ logs.log('Error running trading bots: '+err); });
};

module.exports = tradeSchema;