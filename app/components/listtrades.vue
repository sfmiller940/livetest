<template>
  <div id="trades" class="container-fluid">
    <h2>trades</h2>
    <div class="log row" v-for="trade in trades">
      <div class="col-xs-2">{{trade.created_at}}</div>
      <div class="col-xs-10">{{trade.bot}}</div>
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