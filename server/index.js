"use strict"
const express      = require('express'),
      app          = express(),
      path         = require('path'),
      bodyParser   = require('body-parser');

var runServer = function(logs,bots,trades){

  app

    .set('port', 5000)

    .use([
      bodyParser.json(),
      bodyParser.urlencoded({extended: true }),
      express.static(path.join(__dirname, 'public')),
    ])

    .get('/logs', function(req, res){
      logs.find({})
        .sort('created_at')
        .batchSize(100000)
        .exec(function (err, docs) {
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .get('/bots', function(req, res){
      bots.find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec(function (err, bots) {
          if(err) console.log(err);
          res.json(bots);
        }
      );
    })

    .post('/bots',function(req,res){
      var bot = new bots({
        pair:req.body.pair,
        strategy:req.body.strategy,
        params:req.body.params,
        base:req.body.base,
        quote:req.body.quote,
        active: ( req.body.active ? true : false)
      });
      bot.save(function(err,message){
        if(err){
          console.log('Error saving bot: '+err);
          res.redirect('/?botCreated=false');
        }
        else{
          res.redirect('/?botCreated=true');
        }
      });
    })

    .post('/bots/delete/:botid',function(req,res){
      bots.findById(req.params.botid).remove(function(err,message){
        if(err) res.redirect('/?botDeleted=false');
        else res.redirect('/?botDeleted=true');
      });
    })

    .post('/bots/update/:botid',function(req,res){
      bots.update(
        {_id:req.params.botid},
        {$set:{ 
          pair:req.body.pair,
          strategy:req.body.strategy,
          params:req.body.params,
          base:req.body.base,
          quote:req.body.quote,
          active: ( req.body.active ? true : false)
        }},
        function(err){
          if(err) res.send(err.message);
          else res.send('true');
        }
      );
    })

    .get('/trades', function(req, res){
      trades.find({})
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