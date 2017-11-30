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

    .get('/logs', (req, res)=>{
      logs.find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec((err, docs)=>{
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .get('/bots', (req, res)=>{
      bots.find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec((err, docs)=>{
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .post('/bots',(req,res)=>{
      bots.create({
        pair:req.body.pair,
        signal:req.body.signal,
        params:req.body.params,
        exchange:req.body.exchange,
        base:req.body.base,
        baseAmt:req.body.baseAmt,
        quote:req.body.quote,
        quoteAmt:req.body.quoteAmt,
        active: ( req.body.active ? true : false)
      },
      (err,bot)=>{
        if(err){
          console.log('Error saving bot: '+err);
          res.redirect('/?botCreated=false');
        }
        else{
          res.redirect('/?botCreated=true');
        }
      });
    })

    .post('/bots/delete/:botid',(req,res)=>{
      bots.findById(req.params.botid).remove((err,message)=>{
        if(err) res.redirect('/?botDeleted=false');
        else res.redirect('/?botDeleted=true');
      });
    })

    .post('/bots/update/:botid',(req,res)=>{
      bots.update(
        {_id:req.params.botid},
        {$set:{ 
          pair:req.body.pair,
          signal:req.body.signal,
          params:req.body.params,
          base:req.body.base,
          quote:req.body.quote,
          active: ( req.body.active ? true : false)
        }},
        (err,bot)=>{
          if(err) res.send(err.message);
          else res.send('true');
        }
      );
    })

    .get('/trades', (req, res)=>{
      trades.find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec((err, docs)=>{
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

    .listen(app.get('port'),()=>{
      console.log('Node server running at http://localhost:'+app.get('port'));
    });
};

module.exports = runServer;