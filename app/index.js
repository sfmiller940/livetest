const AUTOBAHN_DEBUG = true;

import Vue from 'vue';
import dashboard from './components/dashboard.vue';
import listlogs from './components/listlogs.vue';
import createbot from './components/createbot.vue';
import listbots from './components/listbots.vue';
import listtrades from './components/listtrades.vue';
import moment from 'moment-timezone';
const axios    = require('axios');

Vue.filter('niceDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('MM/DD/YY HH:mm')
  }
});
Vue.filter('plotlyDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
  }
});
Vue.filter('timeSince',function(value){
  if(value){
    var diff = new Date().getTime() - new Date(value).getTime();
    return Math.floor( diff / (1000*24*3600) ) + ':' + moment.utc(moment.duration(diff).asMilliseconds()).format("HH:mm");
  }
});

var botwatch = new Vue({
  el: '#botwatch',
  components: {
    'dashboard': dashboard,
    'listlogs': listlogs,
    'createbot': createbot,
    'listbots': listbots,
    'listtrades': listtrades
  },
  data:{
    'logs':[],
    'bots':[],
    'botsran':'',
    'markets':[],
    'lasttrade':'',
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
        var bots = message.init.bots;
        Vue.set( botwatch, 'logs', message.init.logs );
        Vue.set( botwatch, 'bots', bots );
        Vue.set( botwatch, 'trades', message.init.trades.slice(0,20) );
        axios
          .get('/trades')
          .then(trades=>{
            trades = trades.data;
            bots.forEach((bot,ind)=>{
              var botTrades = trades.filter(trade=>{ return trade.bot == bot._id });
              bots[ind]['numTrades'] = botTrades.length;
              if(bots[ind].numTrades!=0){
                var firstTrade = botTrades[botTrades.length-1];
                bots[ind]['origValue'] = firstTrade.baseAmt + (firstTrade.quoteAmt * firstTrade.price);
                bots[ind]['origPrice'] = firstTrade.price;
              }
            });
            Vue.set( botwatch, 'bots', bots );
          })
          .catch(err=>{ console.log('Failed to get trades: ',err); });
      }
      else if('log' in message) botwatch.logs.splice(0,0,message.log);
      else if('trade' in message){
        botwatch.trades.splice(0,0,message.trade);
        botwatch.trades.pop();

        var botInd = botwatch.bots.findIndex((bot)=>{ return bot._id == message.trade.bot[0]; });
        var newBot = botwatch.bots[botInd];
        newBot['baseAmt'] = message.trade.baseAmt;
        newBot['quoteAmt'] = message.trade.quoteAmt;
        newBot['numTrades']++;
        if(! ('origValue' in newBot)){
          newBot['origValue'] = message.trade.baseAmt + (message.trade.quoteAmt * message.trade.price);
          newBot['origPrice'] = message.trade.price;
        }
        Vue.set(botwatch.bots, botInd, newBot );
        Vue.set(botwatch, 'lasttrade', message.trade.created_at);
      }
      else if('botsRan' in message){
        Vue.set(botwatch,'botsran',message.botsRan);
      }
    }
    function onPoloMessage(event){
      var message = JSON.parse(event.data);
      if( message[0]!=1002 || message[1]==1) return;

      var ind = botwatch.markets.findIndex(market => market.id == message[2][0]);
      if(-1 == ind ) console.log('Missing market: ', message[2][0]);
      Vue.set( botwatch.ticker, botwatch.markets[ind].pair, (Number(message[2][2]) + Number(message[2][3]))/2 );
    }

    axios
      .get('https://poloniex.com/public?command=returnTicker')
      .then(ticker=>{

        ticker=ticker.data;
        var markets = [];
        for(var pair in ticker){
          Vue.set(botwatch.ticker,pair,(Number(ticker[pair].lowestAsk) + Number(ticker[pair].highestBid))/2);

          markets.push({
            'pair':pair,
            'id':ticker[pair].id,
            'base':pair.split('_')[0],
            'quote':pair.split('_')[1]
          });
        }
        markets.sort(function(a,b){
          if(a.base != b.base) return a.base < b.base ? -1 : 1;
          return a.quote < b.quote ? -1 : 1;
        });
        Vue.set(botwatch, 'markets', markets);

        startWS('ws://localhost:8080',onLocalMessage);  
        startWS('wss://api2.poloniex.com',onPoloMessage);   
      })
      .catch(err=>{
        console.log('Failed to get ticker: ',err);
      });   
  }
})
