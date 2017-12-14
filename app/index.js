import Vue from 'vue'
import listlogs from './components/listlogs.vue'
import createbot from './components/createbot.vue'
import listbots from './components/listbots.vue'
import listtrades from './components/listtrades.vue'
import moment from 'moment-timezone'
const autobahn = require('autobahn'),
      axios    = require('axios');

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('HH:mm MM/DD/YY')
  }
})

var botwatch = new Vue({
  el: '#botwatch',
  components: {
    'listlogs': listlogs,
    'createbot': createbot,
    'listbots': listbots,
    'listtrades': listtrades
  },
  data:{
    'logs':[],
    'bots':[],
    'trades':[],
    'ticker':{}
  },
  created:function(){

    var poloWS = new autobahn.Connection({
      url: 'wss://api.poloniex.com',
      realm: 'realm1',
      max_retries: -1,            // Maximum number of reconnection attempts. Unlimited if set to -1 (default: 15)
      initial_retry_delay: 1,     // Initial delay for reconnection attempt in seconds  (default: 1.5)
      max_retry_delay: 5,         // Maximum delay for reconnection attempts in seconds (default: 300)
      retry_delay_growth: 1.5,    // The growth factor applied to the retry delay between reconnection attempts (default: 1.5)
    });
    poloWS.onerror = function(err,details){ console.log('Polo WS error: '+err); };
    poloWS.onclose = function(err,details){ console.log('Polo WS disconnected: '+err); };
    poloWS.onopen = function (session,details) {
      console.log('Polo WS connected: ', details);
      function loadTicker(args) {
        console.log(args);
        Vue.set( botwatch.ticker, args[0] , (Number(args[2]) + Number(args[3]))/2 );
      }
      session.subscribe('ticker', loadTicker);
    };
    poloWS.open();

    function startLocalWS(server,onMessage){
      const localWS = new WebSocket(server);
      localWS.addEventListener('open', function (event) {
          console.log(server+' WS opened: ', event);
      });
      localWS.addEventListener('close', function (close) {
          console.log(server+' WS closed: '+close);
          setTimeout(()=>{startLocalWS(server,onMessage);},1000);
      });
      localWS.addEventListener('error', function (err) {
          console.log(server+' WS error: '+err);
      });
      localWS.addEventListener('message',onMessage);
    }
    function onLocalMessage(event){
      var message = JSON.parse(event.data);
      if('init' in message){
        Vue.set( botwatch, 'logs', message.init.logs );
        Vue.set( botwatch, 'bots', message.init.bots );
        Vue.set( botwatch, 'trades', message.init.trades );
      }
      else if('log' in message) botwatch.logs.splice(0,0,message.log);
      else if('trade' in message){
        botwatch.trades.splice(0,0,message.trade);
        botwatch.trades.pop();

        var botInd = botwatch.bots.findIndex((bot)=>{ return bot._id == message.trade.bot[0]; });
        var newBot = botwatch.bots[botInd];
        newBot['baseAmt'] = message.trade.baseAmt;
        newBot['quoteAmt'] = message.trade.quoteAmt;
        Vue.set(botwatch.bots, botInd, newBot );
      }
    }
    startLocalWS('ws://localhost:8080',onLocalMessage);
  }
})
