<template>
  <header id="dashboard" class="container-fluid">
    <div class="row">
      <div class="col col-xs-3"><h2>
        {{bots.length}} Bots:
        <span v-if="bots.reduce((total,bot)=>{
            return total + ticker[bot.base+'_'+bot.quote]; },0)">
          {{ bots.reduce(function(total,bot){
            return total + bot.baseAmt + ( bot.quoteAmt * ticker[bot.base+'_'+bot.quote] );
          },0).toFixed(8) }}
        </span>
        <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        Total
      </h2></div>
      <div class="col col-xs-2">Last Run: 
        <span v-if="botsran">{{ botsran | niceDate }}</span>
        <i v-else class="fa fa-spinner fa-spin"></i>
      </div>
      <div class="col col-xs-2">Last Trade: 
        <span v-if="lasttrade">{{ lasttrade | niceDate }}</span>
        <i v-else class="fa fa-spinner fa-spin"></i>
      </div>
      <div class="col col-xs-5">
        <div id="brand">
          <h1 id="title">b<img src="img/HAL9000.svg">twatch</h1>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'dashboard',
  data () {
    return {}
  },
  props:['bots','botsran','lasttrade','ticker']
}
</script>