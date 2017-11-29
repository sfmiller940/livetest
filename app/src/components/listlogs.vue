<template>
  <div class="logs container-fluid">
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