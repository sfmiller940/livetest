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
        <div class="col col-xs-1">Trades</div>
        <div class="col col-xs-1">Created</div>
        <div class="col col-xs-2">Base</div>
        <div class="col col-xs-2">Quote</div>
        <div class="col col-xs-2">Value</div>
        <div class="col col-xs-2">Params</div>
        <div class="col col-xs-1 active">Active</div>
        <div class="col col-xs-1"></div>
      </div>
      <div class="bot row" v-for="(bot,ind) in bots" v-if="bot.base==currbase">
        <div class="col col-xs-1 created">
          <label class="trades"><input type="checkbox" v-on:click="toggleTrades(bot,ind)"><i class="fa fa-caret-up"></i></label>
        </div>
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
        <div class="col col-xs-2">{{bot.params}}</div>
        <div class="col col-xs-1 active">
          <label class="active"><input type="checkbox" v-model="bot.active" v-on:click="toggleActive(bot)"><i class="fa fa-check"></i></label>
        </div>
        <div class="col col-xs-1">
          <button class="delete" v-on:click="deleteBot(bot._id)">delete</button>
        </div>
        <div class="col col-xs-12" v-if="bot.trades">
          <div class="row header">
            <div class="col col-xs-1">Created</div>
            <div class="col col-xs-2">Price</div>
            <div class="col col-xs-2">Base Amount</div>
            <div class="col col-xs-2">Quote Amount</div>
            <div class="col col-xs-2">Value</div>
          </div>
          <div class="row bot-trade" v-for="trade in bot.trades">
            <div class="col col-xs-1">{{trade.created_at | formatDate}}</div>
            <div class="col col-xs-2">{{trade.price.toFixed(8)}} {{bot.base}}_{{bot.quote}}</div>
            <div class="col col-xs-2">{{trade.baseAmt.toFixed(8)}} {{bot.base}}</div>
            <div class="col col-xs-2">{{trade.quoteAmt.toFixed(8)}} {{bot.quote}}</div>
            <div class="col col-xs-2">{{(trade.baseAmt + (trade.quoteAmt*trade.price)).toFixed(8) }} {{bot.base}}</div>
          </div>
        </div>
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
    },
    toggleTrades:function(bot,ind){
      var self = this;
      if(bot.trades){ 
        bot.trades='';
        self.bots.splice( ind, 1, bot );
      }
      else{
        axios
          .get('trades/bot/'+bot._id)
          .then((response)=>{
            bot['trades'] = response.data;
            self.bots.splice( ind, 1, bot );
          })
          .catch((err)=>{console.log('Error getting trades: '+err);});
      }
    },
    toggleActive:function(bot){
      var self=this;
      axios
        .get('bots/activate/'+bot._id)
        .catch((err)=>{ console.log('Error activating bot: '+err) });
    }
  }
}
</script>