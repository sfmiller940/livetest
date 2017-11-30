<template>
  <div id="logs" class="container-fluid">
    <h2>logs</h2>
    <div class="log row" v-for="log in logs">
      <div class="col-xs-2">{{log.created_at}}</div>
      <div class="col-xs-10">{{log.message}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'listlogs',
  data () {
    return {
      logs: []
    }
  },
  props:['logs']
}
</script>