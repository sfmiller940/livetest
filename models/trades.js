"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

var tradeSchema = new Schema({
  bot:         [{ type: Schema.Types.ObjectId, ref: 'bots' }],
  pair:        String,
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

module.exports = tradeSchema;