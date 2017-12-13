<template>
  <div id="bots" class="container-fluid">
    <h2>bots</h2>
    <div class="totals row">
      <div class="col col-xs-1"><strong>Total Bots:</strong></div>
      <div class="col col-xs-3"><strong>{{bots.length}}</strong></div>
      <div class="col col-xs-1"><strong>Total value:</strong></div>
      <div class="col col-xs-7">
        <strong v-if="bots.reduce((total,bot)=>{
            return total + ticker[bot.base+'_'+bot.quote]; },0)">
          {{ bots.reduce(function(total,bot){
            return total + bot.baseAmt + ( bot.quoteAmt * ticker[bot.base+'_'+bot.quote] );
          },0).toFixed(8) }}
        </strong>
        <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
      </div>
    </div>
    <div class="currency_base" v-for="currbase in ['BTC','ETH','USDT','XMR']">
      <h3>{{ currbase }}</h3>
      <div class="row header">
        <div class="col col-xs-1">Created</div>
        <div class="col col-xs-2">Base</div>
        <div class="col col-xs-2">Quote</div>
        <div class="col col-xs-2">Value</div>
        <div class="col col-xs-3">Params</div>
        <div class="col col-xs-1 active">Active</div>
        <div class="col col-xs-1"></div>
      </div>
      <div class="bot row" v-for="bot in bots" v-if="bot.base==currbase">
        <div class="col col-xs-1 created">{{bot.created_at | formatDate}}</div>
        <div class="col col-xs-2"><transition name="fadegreen">
          <span :key="bot.baseAmt">{{bot.baseAmt.toFixed(8)}} {{bot.base}}</span>
        </transition></div>
        <div class="col col-xs-2"><transition name="fadegreen">
          <span :key="bot.quoteAmt">{{bot.quoteAmt.toFixed(8)}} {{bot.quote}}</span>
        </transition></div>
        <div class="col col-xs-2">
          <span v-if="ticker[bot.base+'_'+bot.quote]">
            <transition name="fadegreen">
              <span :key="ticker[bot.base+'_'+bot.quote]">{{ ( Number(bot.baseAmt) + (Number(bot.quoteAmt) * ticker[bot.base+'_'+bot.quote])).toFixed(8)}}{{bot.base}}</span>
            </transition>
          </span>
          <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        </div>
        <div class="col col-xs-3">{{bot.params}}</div>
        <div class="col col-xs-1 active"><input type="checkbox" v-model="bot.active"></div>
        <div class="col col-xs-1"><button class="delete" v-on:click="deleteBot(bot._id)">delete</button></div>
      </div>
      <div class="totals row">
        <div class="col col-xs-4"><strong>{{bots.reduce((total,bot)=>{
          return bot.base == currbase ? total+1 : total  },0)}} Bots</strong></div>
        <div class="col col-xs-1"><strong>Total value:</strong></div>
        <div class="col col-xs-7">
          <strong v-if="bots.reduce((showme,bot)=>{
              return bot.base==currbase && isNaN( ticker[bot.base+'_'+bot.quote]) ? false : showme; 
            },true)">
            {{ bots.reduce(function(total,bot){
              return bot.base==currbase ? ( total + bot.baseAmt + ( bot.quoteAmt * ticker[bot.base+'_'+bot.quote] )) : total;
            },0).toFixed(8) }}{{ currbase }}
          </strong>
          <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        </div>
      </div>
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
          self.bots.splice(self.bots.findIndex((bot)=>{ return bot._id == id; }),1);
        })
        .catch((err)=>{console.log('Error deleting bot: '+err)});
    }
  }
}
</script>