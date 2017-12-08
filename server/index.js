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

    .get('/logs/clear', (req, res)=>{
      logs.remove({})
        .then(()=>{
          res.json({"response":true});
        })
        .catch((err)=>{ console.log('Error clearing logs: '+err); });
    })

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

    .get('/bots/delete/:botid',(req,res)=>{
      bots.findById(req.params.botid).remove((err,message)=>{
        if(err) res.redirect('/?botDeleted=false');
        else res.redirect('/?botDeleted=true');
      });
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
      Promise.all(
        req.body.quotes.map((quote)=>{
          return bots.create({
            exchange:req.body.exchange,
            base:req.body.base,
            baseAmt:req.body.baseAmt,
            quote:quote,
            quoteAmt:req.body.quoteAmt,
            params:req.body.params,
            active:req.body.active
          });
        })
      )
      .then((results)=>{
        res.redirect('/?botCreated=true');
      })
      .catch((err)=>{
        console.log('Error saving bot: '+err);
        res.redirect('/?botCreated=false');
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