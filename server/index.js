"use strict"
const express      = require('express'),
      app          = express(),
      path         = require('path'),
      bodyParser   = require('body-parser');

var runServer = function(logs,bots,trades,wss){

  wss.on('connection', function connection(ws) {
    Promise.all([
      logs.find({}).sort('-created_at').batchSize(100000).exec(),
      trades.find({}).sort('-created_at').limit(20).exec(),
      bots
        .find({})
        .sort('-created_at')
        .batchSize(100000)
        .lean()
        .exec()
        .then((bots)=>{
          return Promise.all( 
            bots.map(bot=>{
              return trades
                .count({bot:bot})
                .exec()
                .then(numTrades=>{
                  bot['numTrades']=numTrades;
                  if(numTrades==0) return bot;
                  return trades
                    .findOne({bot:bot})
                    .sort('created_at')
                    .lean()
                    .exec()
                    .then(trade=>{
                      bot['origValue'] = trade.baseAmt + (trade.quoteAmt * trade.price);
                      bot['origPrice'] = trade.price;
                      return bot;
                    });
                });
            }) 
          );
        })
        .catch((err)=>{ console.log(err); })
    ])
    .then(([logs,trades,bots])=>{ ws.send(JSON.stringify({'init':{'logs':logs,'bots':bots,'trades':trades}})); })
    .catch((err)=>"Error getting models: "+err);
  });

  app

    .set('port', 5000)

    .use([
      bodyParser.json(),
      bodyParser.urlencoded({extended: true }),
      express.static(path.join(__dirname, 'public')),
    ])

    .get('/logs/clear', (req, res)=>{
      logs
        .remove({})
        .then(()=>{ res.json({"response":true}); })
        .catch((err)=>{ 
          console.log('Error clearing logs: '+err);
          res.status(400).send({ message: 'Error clearing logs: '+err});
        });
    })

    .get('/logs', (req, res)=>{
      logs
        .find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec()
        .then((docs)=>{ res.json(docs); })
        .catch((err)=>{ console.log(err); });
    })

    .get('/bots/delete/:botid',(req,res)=>{
      trades
        .find({bot:req.params.botid})
        .remove()
        .then((message)=>{
          bots
            .findById(req.params.botid)
            .remove()
            .then((message)=>{ res.json(message); })
            .catch((err)=>{
              console.log('Error deleting bot: '+err);
              res.status(400).send({ message: 'Error deleting bot: '+err});
            });
        })
        .catch((err)=>{
          console.log('Error deleting trades: '+err);
          res.status(400).send({ message: 'Error deleting trades: '+err});
        });
    })

    .get('/bots', (req, res)=>{
      bots
        .find({})
        .sort('-created_at')
        .batchSize(100000)
        .lean()
        .exec()
        .then((bots)=>{ res.json(bots); });
    })

    .post('/bots',(req,res)=>{
      Promise.all(
        req.body.quotes.map((quote)=>{
          return bots
            .create({
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
      .then((newBots)=>{ res.json(newBots); })
      .catch((err)=>{
        console.log('Error saving bots: '+err);
        res.status(400).send({ message: 'Error saving bots: '+err});
      });
    })

    .post('/bots/update/:botid',(req,res)=>{
      bots
        .update(
          {_id:req.params.botid},
          {$set:{ 
            pair:req.body.pair,
            signal:req.body.signal,
            params:req.body.params,
            base:req.body.base,
            quote:req.body.quote,
            active: ( req.body.active ? true : false)
          }}
        )
        .then((bot)=>{ res.send('true'); })
        .catch((err)=>{ res.send(err.message); });
    })

    .get('/bots/activate/:botid',(req,res)=>{
      bots
        .findOne({_id:req.params.botid})
        .then((bot)=>{
          bot.active = ! bot.active;
          bot
            .save()
            .then((bot)=>{ res.json(bot); })
        })
        .catch((err)=>{ res.send(err.message); });
    })

    .get('/trades', (req, res)=>{
      trades
        .find({})
        .sort('-created_at')
        .batchSize(100000)
        .exec()
        .then((docs)=>{ res.json(docs); })
        .catch((err)=>{ console.log(err); });
    })

    .get('/trades/bot/:botid', (req, res)=>{
      trades
        .find({bot:req.params.botid})
        .sort('-created_at')
        .batchSize(100000)
        .exec()
        .then((docs)=>{ res.json(docs); })
        .catch((err)=>{ console.log(err); });
    })

    .listen(app.get('port'),()=>{
      console.log('http://localhost:'+app.get('port')+' - HTTP server running.');
    });
};

module.exports = runServer;