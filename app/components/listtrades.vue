<template>
  <div id="trades" class="container-fluid">
    <h2>recent trades</h2>
    <div class="row header trade">
      <div class="col col-xs-2 created">Created</div>
      <div class="col col-xs-2 price">Value</div>
      <div class="col col-xs-2 base">Base</div>
      <div class="col col-xs-2 quote">Quote</div>
      <div class="col col-xs-2 price">Price</div>
    </div>
    <div class="trade row" v-for="trade in trades">
      <div class="col col-xs-2 created">{{trade.created_at | niceDatess}}</div>
      <div class="col col-xs-2 value">{{(trade.baseAmt+(trade.quoteAmt*trade.price)).toFixed(8)}} {{trade.base}}</div>
      <div class="col col-xs-2 base">{{trade.baseAmt.toFixed(8)}} {{trade.base}}</div>
      <div class="col col-xs-2 quote">{{trade.quoteAmt.toFixed(8)}} {{trade.quote}}</div>
      <div class="col col-xs-2 price">{{trade.price.toFixed(8)}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'listtrades',
  data () {
    return {
      trades: []
    }
  },
  props:['trades']
}
</script>