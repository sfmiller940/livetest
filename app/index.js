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
    this.loadLogs();
    this.loadBots();
    this.loadTrades();

    var connection = new autobahn.Connection({
      url: 'wss://api.poloniex.com',
      realm: 'realm1',
      max_retries: -1,            // Maximum number of reconnection attempts. Unlimited if set to -1 (default: 15)
      initial_retry_delay: 1,     // Initial delay for reconnection attempt in seconds  (default: 1.5)
      max_retry_delay: 5,         // Maximum delay for reconnection attempts in seconds (default: 300)
      retry_delay_growth: 1.5,    // The growth factor applied to the retry delay between reconnection attempts (default: 1.5)
    });
    connection.onerror = function(err,details){ console.log('WS connection error: '+err); };
    connection.onclose = function(err,details){ console.log('WS disconnected: '+err); };
    connection.onopen = function (session,details) {
      console.log('WS connected');
      function loadTicker(args) {
        Vue.set( botwatch.ticker, args[0] , (Number(args[2]) + Number(args[3]))/2 );
      }
      session.subscribe('ticker', loadTicker);
    };
    connection.open();
  },      
  methods:{
    loadLogs:function(){
      axios
        .get('/logs')
        .then((response)=>{
          Vue.set( botwatch, 'logs', response.data );
        })
        .catch((err)=>{ console.log('Error loading logs: '+err); });
    },
    loadBots:function(){
      axios
        .get('/bots')
        .then((response)=>{
          Vue.set( botwatch, 'bots', response.data );
        })
        .catch((err)=>{ console.log('Error loading bots: '+err); });
    },    
    loadTrades:function(){
      axios
        .get('/trades').then((response)=>{
          Vue.set( botwatch, 'trades', response.data );
        })
        .catch((err)=>{ console.log('Error loading trades: '+err); });
    }
  }
})
