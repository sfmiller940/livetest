
<template>
  <h2>Bots</h2>
  <div class="row header">
    <div class="col-1">Exchange</div>
    <div class="col-1">Base</div>
    <div class="col-1">Base Amount</div>
    <div class="col-1">Quote</div>
    <div class="col-1">Quote Amount</div>
    <div class="col-2">Signal</div>
    <div class="col-2">Params</div>
    <div class="col-1">Active</div>
    <div class="col-1"></div>
    <div class="col-1"></div>
  </div>
  <form action="/bots" method="post">
  <div class="row create">
    <div class="col-1">
      <label for="exchange"><select name="exchange">
        <option value="bittrex">Bittrex</option>
        <option value="poloniex" selected>Poloniex</option>
      </select></label>
    </div>
    <div class="col-1">
      <label for="base"><input name="base" type="text" value="USDT"></label>
    </div>
    <div class="col-1">
      <label for="baseAmt"><input name ="baseAmt" type="number" value="50" step="0.00000001"></label></label>
    </div>
    <div class="col-1">
      <label for="quote"><input name="quote" type="text" value="BTC"></label>
    </div>
    <div class="col-1" class="col-1">
      <label for="quoteAmt"><input name="quoteAmt" type="number" value="0" step="0.00000001"></label>
    </div>
    <div class="col-2">
      <label for="signal"><select name="signal">
        <option value="bladerunner" selected>Bladerunner</option>
        <option value="macd1">Moving Average Crossover</option>
        <option value="macd2">MACD vs Moving MACD Crossover</option>
      </select></label>
    </div>
    <div class="col-2">
      <label for="params"><textarea name="params" rows="4" cols="40">
{
"len":3,
"period":300
}
      </textarea></label>
    </div>
    <div class="col-1">
      <label for="active"><input name="active" type="checkbox" checked></label>
    </div>
    <div class="col-1">
      <input type="submit" value="Create">
    </div>
    <div class="col-1"></div>
  </div>
  </form>
  {{#each bots}}
    <div class="row bot" id="{{_id}}">
      <div class="col-1" class="col-1"><input name="exchange" type="text" value="{{exchange}}"></div>
      <div class="col-1" class="col-1"><input name="base" type="text" value="{{base}}"></div>
      <div class="col-1"><input name="baseAmt" type="number" value="{{baseAmt}}" step="0.00000001"></div>
      <div class="col-1" class="col-1"><input name="quote" type="text" value="{{quote}}"></div>
      <div class="col-1"><input name="quoteAmt" type="number" value="{{quoteAmt}}" step="0.00000001"></div>
      <div class="col-2"><input name="signal" type="text" value="{{signal}}"></div>
      <div class="col-2"><input name="params" type="text" value="{{params}}"></div>
      <div class="col-1"><input type="checkbox" name="active" {{#if active}}checked{{/if}}></div>
      <div class="col-1"><button>update</button></div>
      <div class="col-1"><form method="post" action="/bots/delete/{{_id}}"><input type="submit" value="delete"></form></div>
    </div>
  {{/each}}
</template>