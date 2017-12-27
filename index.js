"use strict"
const cluster     = require('cluster'),
      stopSignals = [
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
      ];

cluster.on('disconnect', function(worker) {
    console.log('worker %d died. restarting...', worker.process.pid);
    cluster.fork();
});
cluster.on('exit', (worker, code, signal) => {
  console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code);
  cluster.fork();
});

if (cluster.isMaster) {
  
  console.log('Starting worker...');
  cluster.fork();

  stopSignals.forEach(function (signal) {
    process.on(signal, function () {
      console.log(`Got ${signal}, stopping workers...`);
      cluster.disconnect(function () {
        console.log('All workers stopped, exiting.');
        process.exit(0);
      });
    });
  });
} else {

  const { logs:logs,
            bots:bots,
            trades:trades
          }          = require('./models'),
          server     = require('./server'),
          conns      = require('./conns'),
          signals    = require('./signals');

  logs.config(conns.wss.broadcast);
  logs.log('Worker started.');

  server(logs,bots,trades,conns.wss);

  var poloniex = conns.configPolo(logs);

  console.log('Configuring...');
  signals
    .config(poloniex)
    .catch(err=>{logs.log('Error configuring signals: '+err);})
    .then(()=>{

      bots.config(
        conns.wss.broadcast,
        logs,
        poloniex,
        signals
      );

      trades.config(
        conns.wss.broadcast,
        bots,
        logs,
        signals
      );

      console.log('Configuration complete.');
      poloniex.openWebSocket({version:2});

      function runBots(){
        bots
          .run()
          .then(()=>{runBots();})
          .catch(err=>{logs.log('Error running bots: '+err);});
      }
      runBots();

      function runTrades(){
        trades
          .run()
          .then(()=>{runTrades();})
          .catch(err=>{logs.log('Error running trades: '+err);});
      }
      runTrades();

    })
    .catch(err=>{logs.log('Error running bots and trades: '+err);});
}