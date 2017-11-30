<template>
  <div id="createbot" class="container-fluid">
    <h2>create</h2>
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
    <div class="row create">
      <div class="col-xs-1">
        <label for="exchange"><select name="exchange">
          <option value="bittrex">Bittrex</option>
          <option value="poloniex" selected>Poloniex</option>
        </select></label>
      </div>
      <div class="col-xs-1">
        <label for="base"><select name="base">
          <option value="BTC">BTC</option>
          <option value="USDT" selected>USDT</option>
        </select></label>
      </div>
      <div class="col-xs-1">
        <label for="baseAmt"><input name ="baseAmt" type="number" value="1" step="0.00000001"></label></label>
      </div>
      <div class="col-xs-1">
        <label for="quote"><input name="quote" type="text" value="BTC"></label>
      </div>
      <div class="col-xs-1" class="col-xs-1">
        <label for="quoteAmt"><input name="quoteAmt" type="number" value="0" step="0.00000001"></label>
      </div>
      <div class="col-xs-2">
        <label for="signal"><select name="signal">
          <option value="bladerunner" selected>Bladerunner</option>
          <option value="macd1">Moving Average Crossover</option>
          <option value="macd2">MACD vs Moving MACD Crossover</option>
        </select></label>
      </div>
      <div class="col-xs-2">
        <label for="params"><textarea name="params" rows="4" col-xss="40">
  {
  "len":3,
  "period":300
  }
        </textarea></label>
      </div>
      <div class="col-xs-1">
        <label for="active"><input name="active" type="checkbox" checked></label>
      </div>
      <div class="col-xs-1">
        <input type="submit" value="Create">
      </div>
      <div class="col-xs-1"></div>
    </div>
  </div>
</template>