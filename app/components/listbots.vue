<template>
  <div id="bots" class="container-fluid">
    <h2>bots</h2>
    <div class="row header">
      <div class="col col-xs-1">Created</div>
      <div class="col col-xs-2">Base</div>
      <div class="col col-xs-2">Quote</div>
      <div class="col col-xs-2">Value</div>
      <div class="col col-xs-3">Signal{Params}</div>
      <div class="col col-xs-1 active">Active</div>
      <div class="col col-xs-1"></div>
    </div>
    <div class="bot row" v-for="bot in bots">
      <div class="col col-xs-1 created">{{bot.created_at | formatDate}}</div>
      <div class="col col-xs-2">{{bot.baseAmt.toFixed(8)}} {{bot.base}}</div>
      <div class="col col-xs-2">{{bot.quoteAmt.toFixed(8)}} {{bot.quote}}</div>
      <div class="col col-xs-2">
        {{ ( Number(bot.baseAmt) + (Number(bot.quoteAmt) * ticker[bot.base+'_'+bot.quote])).toFixed(8)}}{{bot.base}}
      </div>
      <div class="col col-xs-3">{{bot.signal}}{{bot.params}}</div>
      <div class="col col-xs-1 active"><input type="checkbox" v-model="bot.active"></div>
      <div class="col col-xs-1"><button class="delete" v-on:click="deleteBot(bot._id)">delete</button></div>
    </div>
    <div class="totals row">
      <div class="col col-xs-4"><strong>{{bots.length}} Bots</strong></div>
      <div class="col col-xs-1"><strong>Total value:</strong></div>
      <div class="col col-xs-7"><strong>{{ bots.reduce(function(total,bot){
        return total + bot.baseAmt + ( bot.quoteAmt * ticker[bot.base+'_'+bot.quote] );
      },0).toFixed(8) }}</strong></div>
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