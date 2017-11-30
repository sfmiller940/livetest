<template>
  <div id="bots" class="container-fluid">
    <h2>bots</h2>
    <div class="row header">
      <div class="col-xs-1">Exchange</div>
      <div class="col-xs-1">Base</div>
      <div class="col-xs-1">Base Amount</div>
      <div class="col-xs-1">Quote</div>
      <div class="col-xs-1">Quote Amount</div>
      <div class="col-xs-2">Signal</div>
      <div class="col-xs-2">Params</div>
      <div class="col-xs-1">Active</div>
      <div class="col-xs-1"></div>
      <div class="col-xs-1"></div>
    </div>
    <div class="bot row" v-for="bot in bots">
      <div class="col-xs-1">{{bot.exchange}}</div>
      <div class="col-xs-1">{{bot.base}}</div>
      <div class="col-xs-1">{{bot.baseAmt}}</div>
      <div class="col-xs-1">{{bot.quote}}</div>
      <div class="col-xs-1">{{bot.quoteAmt}}</div>
      <div class="col-xs-2">{{bot.signal}}</div>
      <div class="col-xs-2">{{bot.params}}</div>
      <div class="col-xs-1">{{active}}</div>
      <div class="col-xs-1">update?</div>
      <div class="col-xs-1"><form method="post" action="/bots/delete/{{_id}}"><input type="submit" value="delete"></form></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'listbots',
  data () {
    return {
      bots: []
    }
  },
  props:['bots']
}
</script>