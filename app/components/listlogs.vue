<template>
  <div id="logs" class="container-fluid">
    <h2>logs <button v-on:click="clearLogs()" class="clear">clear</button></h2>
    <div class="log row" v-for="log in logs">
      <div class="col col-xs-2">{{log.created_at | niceDate}}</div>
      <div class="col col-xs-10">{{log.message}}</div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  name: 'listlogs',
  data () {
    return {
      logs: []
    }
  },
  props:['logs'],
  methods:{
    clearLogs:function(){
      var self=this;
      axios
        .get('/logs/clear')
        .then((response)=>{ self.logs.splice(0,self.logs.length); })
        .catch((err)=>{ console.log('Error clearing logs: '+err); });
    }
  }
}
</script>