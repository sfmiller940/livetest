"use strict"
const express      = require('express'),
      app          = express(),
      path         = require('path'),
      bodyParser   = require('body-parser');
      
var runServer = function(models){

  app

    .set('port', 5000)

    .use([
      bodyParser.json(),
      express.static(path.join(__dirname, 'public')),
    ])

    .get('/logs', function(req, res){
      models.logs.find({})
        .sort('created_at')
        .batchSize(100000)
        .exec(function (err, docs) {
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .get('/bots', function(req, res){
      models.bots.find({})
        .sort('created_at')
        .batchSize(100000)
        .exec(function (err, docs) {
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .get('/trades', function(req, res){
      models.trades.find({})
        .sort('created_at')
        .batchSize(100000)
        .exec(function (err, docs) {
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });
};

module.exports = runServer;