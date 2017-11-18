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
      bodyParser.urlencoded({extended: true }),
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

    .post('/bots',function(req,res){
      console.log( req.body.pair );
      var bot = new models['bots']({
        pair:req.body.pair,
        signal:req.body.signal,
        params:{},//JSON.parse(req.body.params),
        base:req.body.base,
        quote:req.body.quote,
        active: ( req.body.active ? true : false )
      });
      bot.save(function(err,message){
        if(err){
          console.log('Error saving bot: '+err);
          res.redirect('/?botCreated=False');
        }
        else{
          res.redirect('/?botCreated=True');
        }
      });
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