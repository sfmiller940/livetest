"use strict"
const mongoose       = require('mongoose'),
      Schema         = mongoose.Schema;

var broadcast;

var logSchema = new Schema({
  message:        String,
  created_at:     { type: Date, default: Date.now }
});

logSchema.statics.log = function(message) {
  console.log(message);
  return this
    .create({message:message})
    .then((log)=>{ broadcast({'log':log}); })
    .catch((err)=>{ console.log('Log save error: '+err); });
};

logSchema.statics.setWS = function(ws){ broadcast = ws; };

module.exports = logSchema;