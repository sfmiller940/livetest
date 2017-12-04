<template>
  <div id="bots" class="container-fluid">
    <h2>bots</h2>
    <div class="row header">
      <div class="col col-xs-1">Created</div>
      <div class="col col-xs-1">Exchange</div>
      <div class="col col-xs-2">Base</div>
      <div class="col col-xs-2">Quote</div>
      <div class="col col-xs-1">Signal</div>
      <div class="col col-xs-3">Params</div>
      <div class="col col-xs-1 active">Active</div>
      <div class="col col-xs-1"></div>
    </div>
    <div class="bot row" v-for="bot in bots">
      <div class="col col-xs-1 created">{{bot.created_at | formatDate}}</div>
      <div class="col col-xs-1">{{bot.exchange}}</div>
      <div class="col col-xs-2">{{bot.baseAmt.toFixed(8)}} {{bot.base}}</div>
      <div class="col col-xs-2">{{bot.quoteAmt.toFixed(8)}} {{bot.quote}}</div>
      <div class="col col-xs-1">{{bot.signal}}</div>
      <div class="col col-xs-3">{{bot.params}}</div>
      <div class="col col-xs-1 active"><input type="checkbox" v-model="bot.active"></div>
      <div class="col col-xs-1"><button class="delete" v-on:click="deleteBot(bot._id)">delete</button></div>
    </div>
    <div>
      <div class="col col-xs-2"></div>
      <div class="col col-xs-1">Value:</div>
      <div class="col col-xs-9">{{ bots.reduce(function(total,bot){
        return total + bot.baseAmt;
      },0).toFixed(8) }}</div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  name: 'listbots',
  data () {
    return {
      bots: []
    }
  },
  props:['bots','ticker'],
  methods:{
    deleteBot:function(id){
      var self=this;
      axios
        .get('/bots/delete/'+id)
        .then((response)=>{
          self.$emit('loadbots');
        })
        .catch((err)=>{console.log('Error deleting bot: '+err)});
    }
  }
}
</script>