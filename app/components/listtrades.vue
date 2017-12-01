<template>
  <div id="trades" class="container-fluid">
    <h2>trades</h2>
    <div class="row header">
      <div class="col col-xs-2">Created</div>
      <div class="col col-xs-10">Bot</div>
    </div>
    <div class="log row" v-for="trade in trades">
      <div class="col col-xs-2">{{trade.created_at | formatDate}}</div>
      <div class="col col-xs-10">{{trade.bot}}</div>
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