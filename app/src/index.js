import Vue from 'vue'
import listlogs from './components/listlogs.vue'
const axios = require('axios');

var botwatch = new Vue({
  el: '#botwatch',
  components: {
    'listlogs': listlogs
  },
  data:{
    'logs':[]
  },
  created:function(){
    this.loadLogs();        
  },      
  methods:{
    loadLogs:function(){
      axios.get('/logs').then((response)=>{
        console.log(response.data);
        Vue.set( botwatch, 'logs', response.data );
      });
    }
  }
})
