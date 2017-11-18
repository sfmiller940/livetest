(function($){
  $(function(){

    $.get('/bots',function(bots){
      var source = document.getElementById("bots-template").innerHTML;
      var template = Handlebars.compile(source);
      document.getElementById('bots').innerHTML = template({'bots':bots});

      $('.row.bot button').click(function(){
        var bot = $(this).closest('.bot');

        $.post(
          "/bots/update/" + bot.attr('id'),
          { pair: bot.find('input[name="pair"]').val(),
            base: bot.find('input[name="base"]').val(),
            quote:bot.find('input[name="quote"]').val(),
            signal:bot.find('input[name="signal"]').val(),
            params:bot.find('input[name="params"]').val(),
            active:bot.find('input[name="active"]').val()
          }
        )
        .done(function( data ) {
          if(data == "true") alert('Bot updated.');
          else alert( data );
        });


      });      

    });
  });
}(jQuery));