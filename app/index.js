const AUTOBAHN_DEBUG = true;

import Vue from 'vue';
import listlogs from './components/listlogs.vue';
import createbot from './components/createbot.vue';
import listbots from './components/listbots.vue';
import listtrades from './components/listtrades.vue';
import moment from 'moment-timezone';
const axios    = require('axios');

var markets  = require('poloniex-api-node/lib/markets');
if("200" in markets.markets.byID ) console.log('BTC_STORJ added to polo api.');
else  markets.markets.byID["200"]={"currencyPair":"BTC_STORJ"};

Vue.filter('niceDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('MM/DD/YY HH:mm')
  }
})

Vue.filter('plotlyDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
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

    function startWS(server,onMessage){
      const WS = new WebSocket(server);
      WS.addEventListener('open', function (event) {
        console.log(server+' WS opened: ', event);
        if(server=='wss://api2.poloniex.com') WS.send('{"command" : "subscribe", "channel" : 1002}');
      });
      WS.addEventListener('close', function (close) {
        console.log(server+' WS closed: '+close);
        setTimeout(()=>{startWS(server,onMessage);},1000);
      });
      WS.addEventListener('error', function (err) {
        console.log(server+' WS error: '+err);
      });
      WS.addEventListener('message',onMessage);
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
    function onPoloMessage(event){
      var message = JSON.parse(event.data);
      if(message[0]!=1002) return;
      if(!( message[2][0] in markets.markets.byID )) console.log('Missing market: ', message[2][0]);
      Vue.set( botwatch.ticker, markets.markets.byID[message[2][0]].currencyPair , (Number(message[2][2]) + Number(message[2][3]))/2 );
    }
    startWS('ws://localhost:8080',onLocalMessage);
    startWS('wss://api2.poloniex.com',onPoloMessage);
  }
})
