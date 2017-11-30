import Vue from 'vue'
import listlogs from './components/listlogs.vue'
import createbot from './components/createbot.vue'
import listbots from './components/listbots.vue'
import listtrades from './components/listtrades.vue'
const axios = require('axios');

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
        console.log(response.data);
        Vue.set( botwatch, 'logs', response.data );
      });
    },
    loadBots:function(){
      axios.get('/bots').then((response)=>{
        console.log(response.data);
        Vue.set( botwatch, 'bots', response.data );
      });
    },    
    loadTrades:function(){
      axios.get('/trades').then((response)=>{
        console.log(response.data);
        Vue.set( botwatch, 'trades', response.data );
      });
    }
  }
})
