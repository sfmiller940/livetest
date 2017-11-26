"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

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

module.exports = logSchema;