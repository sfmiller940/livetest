<template>
  <div id="createbot" class="container-fluid">
    <h2>create</h2>
    <div class="row header">
      <div class="col col-xs-1">Exchange</div>
      <div class="col col-xs-1">Base Currency</div>
      <div class="col col-xs-1">Base Amount</div>
      <div class="col col-xs-1">Quote Currency</div>
      <div class="col col-xs-1">Quote Amount</div>
      <div class="col col-xs-2">Signal</div>
      <div class="col col-xs-3">Params</div>
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
          <option value="XMR">XMR</option>
          <option value="USDT" selected>USDT</option>
        </select>
      </div>
      <div class="col col-xs-1">
        <input v-model="baseAmt" type="number" value="1" step="0.00000001">
      </div>
      <div class="col col-xs-1">
        <input v-model="quote" type="text" value="BTC">
      </div>
      <div class="col col-xs-1" class="col col-xs-1">
        <input v-model="quoteAmt" type="number" value="0" step="0.00000001">
      </div>
      <div class="col col-xs-2">
        <select v-model="signal">
          <option value="bladerunner" selected>Bladerunner</option>
          <option value="macd1">Moving Average Crossover</option>
          <option value="macd2">MACD vs Moving MACD Crossover</option>
        </select>
      </div>
      <div class="col col-xs-3">
        <textarea v-model="params" rows="4" col col-xss="40">
  {
  "len":3,
  "period":300
  }
        </textarea>
      </div>
      <div class="col col-xs-1 active">
        <input v-model="active" type="checkbox" checked>
      </div>
      <div class="col col-xs-1">
        <button v-on:click="createBot()">create</button>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  name: 'listtrades',
  data () {
    return {
      exchange: 'poloniex',
      base: 'USDT',
      baseAmt: 1,
      quote: 'BTC',
      quoteAmt: 0,
      signal: 'bladerunner',
      params: '{"period":300,"len":4}',
      active: true
    }
  },
  props:['trades'],
  methods:{
    createBot:function(){
      var self = this;
      axios.post('/bots', {
          exchange: this.exchange,
          base: this.base,
          baseAmt: this.baseAmt,
          quote: this.quote,
          quoteAmt: this.quoteAmt,
          signal: this.signal,
          params: this.params,
          active: this.active
        })
        .then(function (response) {
          self.$emit('loadbots');
        })
        .catch((err)=>{ console.log("Error creating bot: "+err); });
    }
  }
}
</script>