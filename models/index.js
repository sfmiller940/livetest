"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost:27017/livetest',{useMongoClient: true})
  .catch((err)=>{ console.log('Mongodb connections failure: '+err); });

var logSchema = new Schema({
  message:        String,
  created_at:     { type: Date, default: Date.now }
});
logSchema.statics.log = function(message) {
  console.log(message);
  return this
    .create({message:message})
    .catch((err)=>{ console.log('Log save error: '+err); });
}

var botSchema = new Schema({
  pair:        String,
  base:        Number,
  quote:       Number,
  strategy:    String,
  params:      String,
  signal:      { type: Number, default:false},
  active:      { type: Boolean, default:false},
  created_at:  { type: Date, default: Date.now }
});

var tradeSchema = new Schema({
  bot:         [{ type: Schema.Types.ObjectId, ref: 'bots' }],
  pair:        String,
  base:        Number,
  quote:        Number,
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

var models = {
  logs: mongoose.model('logs', logSchema),
  bots: mongoose.model('bots', botSchema),
  trades: mongoose.model('trades', tradeSchema),
};
module.exports = models;