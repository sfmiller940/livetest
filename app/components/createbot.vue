<template>
  <div id="createbot" class="container-fluid">
    <h2>create</h2>
    <div class="row header">
      <div class="col col-xs-1">Exchange</div>
      <div class="col col-xs-1">Base Currency</div>
      <div class="col col-xs-1">Base Amount</div>
      <div class="col col-xs-1">Quote Currency</div>
      <div class="col col-xs-1">Quote Amount</div>
      <div class="col col-xs-1">Period</div>
      <div class="col col-xs-2">Signal</div>
      <div class="col col-xs-2">Params</div>
      <div class="col col-xs-1 active">Active</div>
    </div>
    <div class="row create">
      <div class="col col-xs-1">
        <select v-model="exchange">
          <option value="poloniex" selected>Poloniex</option>
        </select>
      </div>
      <div class="col col-xs-1">
        <select v-model="base">
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT" selected>USDT</option>
          <option value="XMR">XMR</option>
        </select>
      </div>
      <div class="col col-xs-1">
        <input v-model.number="baseAmt" type="number" value="1" step="0.00000001">
      </div>
      <div class="col col-xs-1">
        <select v-model="quotes" multiple>
          <option v-for="market in markets" v-if="base==market.base">{{market.quote}}</option>
        </select>
      </div>
      <div class="col col-xs-1" class="col col-xs-1">
        <input v-model.number="quoteAmt" type="number" value="0" step="0.00000001">
      </div>
      <div class="col col-xs-1">
        <select v-model.number="params.period">
          <option value="300">5 mins</option>
          <option value="900">15 mins</option>
          <option value="1800">30 mins</option>
          <option value="7200">2 hours</option>
          <option value="14400">4 hours</option>
          <option value="86400">1 day</option>
        </select>
      </div>
      <div class="col col-xs-2">
        <select v-model="params.signal">
          <option value="bladerunner" selected>Bladerunner</option>
          <option value="macd1">Moving Average Crossover</option>
          <option value="macd2">MACD vs Average MACD</option>
        </select>
      </div>
      <div class="col col-xs-2">
        <input v-model.number="params.window1" v-if="params.signal!='bladerunner'" type="number" placeholder="short window" step="1" min="2">
        <input v-model.number="params.window2" v-if="params.signal!='bladerunner'" type="number" placeholder="long window" step="1" min="2">
        <input v-model.number="params.len" v-if="params.signal!='macd1'" type="number" placeholder="length" step="1" min="2">
      </div>
      <div class="col col-xs-1 active">
        <label v-bind:class="{ active:true, clicked:active }"><input v-model="active" type="checkbox"><i class="fa fa-check"></i></label>
      </div>
      <div class="col col-xs-1">
        <button v-on:click="createBot(bot)">create</button>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  name: 'createbot',
  data () {
    return {
      exchange: 'poloniex',
      base: 'USDT',
      baseAmt: 1,
      quotes: ['BTC','ETH'],
      quoteAmt: 0,
      params:{
        'signal':'macd1',
        'period':300,
        'len':'',
        'window1':'',
        'window2':''
      },
      active: false
    }
  },
  props:['bots','markets'],
  methods:{
    createBot:function(){
      var self = this;
      axios.post('/bots', {
          exchange: this.exchange,
          base: this.base,
          baseAmt: this.baseAmt,
          quotes: this.quotes,
          quoteAmt: this.quoteAmt,
          params: this.params,
          active: this.active
        })
        .then(function (response) {
          response.data.forEach((bot)=>{ 
            self.bots.splice(0,0,bot); 
          });
        })
        .catch((err)=>{ console.log("Error creating bot: "+err); });
    }
  }
}
</script>