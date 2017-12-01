import Vue from 'vue'
import listlogs from './components/listlogs.vue'
import createbot from './components/createbot.vue'
import listbots from './components/listbots.vue'
import listtrades from './components/listtrades.vue'
import moment from 'moment-timezone'
const axios = require('axios');

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).tz('America/Los_Angeles').format('hh:mm MM/DD/YY')
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
    'trades':[]
  },
  created:function(){
    this.loadLogs();
    this.loadBots();
    this.loadTrades();
  },      
  methods:{
    loadLogs:function(){
      axios.get('/logs').then((response)=>{
        Vue.set( botwatch, 'logs', response.data );
      })
      .catch((err)=>{ console.log('Error loading logs: '+err); });
    },
    loadBots:function(){
      axios.get('/bots').then((response)=>{
        Vue.set( botwatch, 'bots', response.data );
      })
      .catch((err)=>{ console.log('Error loading bots: '+err); });
    },    
    loadTrades:function(){
      axios.get('/trades').then((response)=>{
        Vue.set( botwatch, 'trades', response.data );
      })
      .catch((err)=>{ console.log('Error loading trades: '+err); });
    }
  }
})
