"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/livetest');

var logSchema = new Schema({
  message:        String,
  created_at:     { type: Date, default: Date.now }
});

logSchema.statics.log = function(message) {
  console.log(message);
  this.create({message:message},function(err,message){
    if(err) console.log('Log save error: '+err);
  });
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
  buy:         Boolean,
  quote:       Number,
  price:       Number,
  created_at:  { type: Date, default: Date.now }
});

var models = {
  logs: mongoose.model('logs', logSchema),
  bots: mongoose.model('bots', botSchema),
  trades: mongoose.model('trades', tradeSchema),
};

module.exports = models;