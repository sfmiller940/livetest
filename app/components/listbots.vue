<template>
  <div id="bots" class="container-fluid">
    <div class="currency-base" v-for="currbase in ['BTC','ETH','USDT','XMR']">
      <h2>{{ currbase }} - 
        {{bots.reduce((total,bot)=>{
          return bot.base == currbase ? total+1 : total  },0)}} Bots:
        <span v-if="bots.reduce((showme,bot)=>{
          return bot.base==currbase && isNaN( ticker[bot.base+'_'+bot.quote]) ? false : showme; 
        },true)">
          {{ bots.reduce(function(total,bot){
            return bot.base==currbase ? ( total + getBotValue(bot) ) : total;
          },0).toFixed(8) }}
        </span>
        <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        {{ currbase }} Total
      </h2>
      <div class="row header">
        <div class="col col-xs-1 trades">Trades</div>
        <div class="col col-xs-1 live">D:H:M</div>
        <div class="col col-xs-1 hold">Hold</div>
        <div class="col col-xs-1 profit">Bot</div>
        <div class="col col-xs-1 value">Value</div>
        <div class="col col-xs-1 base">Base</div>
        <div class="col col-xs-1 quote">Quote</div>
        <div class="col col-xs-1 period">Period</div>
        <div class="col col-xs-1 signal">Signal</div>
        <div class="col col-xs-1 params">Params</div>
        <div class="col col-xs-1 tradesper">Trades per Hour</div>
        <div class="col col-xs-1 active">Active</div>
        <div class="col col-xs-1 delete"></div>
      </div>
      <div class="bot row" v-for="(bot,ind) in bots" v-if="bot.base==currbase">
        <div class="col col-xs-1 trades">
          <label v-bind:class="{ trades:true, clicked:bot.trades }"><input type="checkbox" v-on:click="toggleTrades(bot,ind)"><i class="fa fa-caret-up"></i></label>
        </div>
        <div class="col col-xs-1 live">{{bot.created_at | timeSince}}</div>
        <div class="col col-xs-1 hold">
          <span 
            v-if="ticker[bot.base+'_'+bot.quote] && bot.origValue" 
            v-bind:class="{percent:true,profit:getBotHold(bot)>0}"
          > 
            {{getBotHold(bot).toFixed(2)}}%
          </span>
          <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        </div>
        <div class="col col-xs-1 profit">
          <span
            v-if="ticker[bot.base+'_'+bot.quote] && bot.origValue" 
            v-bind:class="{percent:true,profit:getBotProfit(bot)>0}"
          >
            {{getBotProfit(bot).toFixed(2)}}%
          </span>
          <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        </div>        
        <div class="col col-xs-1 value">
          <span v-if="ticker[bot.base+'_'+bot.quote]">
            <transition name="fadeblue">
              <span :key="ticker[bot.base+'_'+bot.quote]">
                {{ getBotValue(bot).toFixed(8)}}
              </span>
            </transition>
          </span>
          <span v-else><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></span>
        </div>
        <div class="col col-xs-1 base"><transition name="fadeblue">
          <span :key="bot.baseAmt">{{bot.baseAmt.toFixed(8)}}</span>
        </transition></div>
        <div class="col col-xs-1 quote"><transition name="fadeblue">
          <span :key="bot.quoteAmt">{{bot.quoteAmt.toFixed(8)}} {{bot.quote}}</span>
        </transition></div>
        <div class="col col-xs-1 period">{{bot.params.period}}</div>
        <div class="col col-xs-1 signal">{{bot.params.signal}}</div>
        <div class="col col-xs-1 params">{
          <span v-if="bot.params.window1">window1: {{bot.params.window1}},</span>
          <span v-if="bot.params.window2">window2: {{bot.params.window2}},</span>
          <span v-if="bot.params.len">length: {{bot.params.len}}<br></span>
        }</div>
        <div class="col col-xs-1 tradesper">
          <span>
            {{(bot.numTrades*1000*3600/(new Date().getTime() - new Date(bot.created_at).getTime())).toFixed(2)}}
          </span>
        </div>
        <div class="col col-xs-1 active">
          <label v-bind:class="{ active:true, clicked:bot.active }">
            <input type="checkbox" v-model="bot.active" v-on:click="toggleActive(bot)"><i class="fa fa-check"></i>
          </label>
        </div>
        <div class="col col-xs-1 delete">
          <button class="delete" v-on:click="deleteBot(bot._id)">delete</button>
        </div>
        <div class="col col-xs-12 bot-trades" v-if="bot.trades">
          <div class="row">
            <div class="col col-xs-12">
              <h3>Price vs Value</h3>
              <div class="row graph">
                <div class="col col-xs-12" v-bind:id="'graph_'+bot._id"></div>
              </div>
            </div>  
            <div class="col col-xs-12">
              <h3>Recent Trades of {{bot.numTrades}} Total</h3>
              <div class="row header trade">
                <div class="col col-xs-2 created">Created</div>
                <div class="col col-xs-2">Value</div>
                <div class="col col-xs-2">Base</div>
                <div class="col col-xs-2">Quote</div>
                <div class="col col-xs-2">Price</div>
              </div>
              <div class="row trade" v-for="trade in bot.trades.slice(0,5)">
                <div class="col col-xs-2 created">{{trade.created_at | niceDate}}</div>
                <div class="col col-xs-2">{{(trade.baseAmt + (trade.quoteAmt*trade.price)).toFixed(8) }} {{bot.base}}</div>
                <div class="col col-xs-2">{{trade.baseAmt.toFixed(8)}} {{bot.base}}</div>
                <div class="col col-xs-2">{{trade.quoteAmt.toFixed(8)}} {{bot.quote}}</div>
                <div class="col col-xs-2">{{trade.price.toFixed(8)}}</div>
              </div>
            </div>          
          </div>
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
    getBotValue:function(bot){
      return Number(bot.baseAmt) + (Number(bot.quoteAmt) * this.ticker[bot.base+'_'+bot.quote]);
    },
    getBotProfit:function(bot){
      return (( this.getBotValue(bot) / bot.origValue) - 1)*100;
    },
    getBotHold:function(bot){
      return ((this.ticker[bot.base+'_'+bot.quote]/bot.origPrice)-1)*100;
    },
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
            self.graphBot(bot,self);
          })
          .catch((err)=>{console.log('Error getting trades: '+err);});
      }
    },
    toggleActive:function(bot){
      var self=this;
      axios
        .get('bots/activate/'+bot._id)
        .catch((err)=>{ console.log('Error activating bot: '+err) });
    },
    graphBot:function(bot,self){

      self.$nextTick(()=>{

        var d3 = Plotly.d3;
        var gd3 = d3.select('#graph_'+bot._id)
            .append('div')
            .style({
                width: '100%',
                height: '100%'
            });
        var gd = gd3.node();

        var traces = [];
        
        traces[0]={
          x: bot.trades.map(function(trade){ return self.$options.filters.plotlyDate(trade.created_at); }),
          y: bot.trades.map(function(trade){ return Number(trade.baseAmt) + (Number(trade.quoteAmt)*Number(trade.price)); }),
          type: 'scatter',
          yaxis: 'y2',
          marker: {
            color: '#f33'
          }
        };

        axios
          .get( 'https://poloniex.com/public?command=returnChartData'
              + '&currencyPair=' + bot.base + '_' + bot.quote
              + '&start=' + parseInt( new Date( bot.trades[bot.trades.length-1].created_at ).getTime() / 1000 )
              + '&end='+ parseInt( new Date().getTime() / 1000 )
              + '&period=' + bot.params.period )
          .then((prices)=>{
            prices = prices.data;
            traces[1]={
              x: prices.map(function(slice){ 
                return self.$options.filters.plotlyDate(new Date(slice.date * 1000).toISOString()); 
              }),
              y: prices.map(function(slice){ return slice.weightedAverage }),
              type: 'scatter',
              marker: {
                color: '#33f'
              }
            };
            Plotly.newPlot(gd,traces.reverse(), {
              showlegend: false,
              annotations: [],
              xaxis : {
                type:'date',
                gridcolor:'#999', 
                zerolinecolor: '#999'
              },
              yaxis1: {
                tickfont: {color: '#33f'},
                title: bot.base+'_'+bot.quote,
                titlefont: {
                  color: '#33f',
                },
                gridcolor:'#99f',
                zerolinecolor: '#99f' 
              },
              yaxis2: {
                tickfont: {color: '#f33'},
                overlaying: 'y',
                side: 'right',
                title: 'Bot Value in '+bot.base,
                titlefont:{
                  color: '#f33',
                },
                gridcolor:'#f99',
                zerolinecolor: '#f99'                
              }
            });
          })
          .catch((err)=>{console.log('Failed to get chart: ',err);});
      });
    }
  }
}
</script>