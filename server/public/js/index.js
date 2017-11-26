(function($){
  $(function(){

    $.get('/bots',function(bots){
      var source = document.getElementById("bots-template").innerHTML;
      var template = Handlebars.compile(source);
      document.getElementById('bots').innerHTML = template({'bots':bots});

      $('.row.bot button').click(function(){
        var botDiv = $(this).closest('.bot');

        $.post(
          "/bots/update/" + botDiv.attr('id'),
          { exchange: botDiv.find('input[name="exchange"]').val(),
            pair: botDiv.find('input[name="pair"]').val(),
            base: botDiv.find('input[name="base"]').val(),
            baseAmt: botDiv.find('input[name="baseAmt"]').val(),
            quote:botDiv.find('input[name="quote"]').val(),
            quoteAmt:botDiv.find('input[name="quoteAmt"]').val(),
            signal:botDiv.find('input[name="signal"]').val(),
            params:botDiv.find('input[name="params"]').val(),
            active:botDiv.find('input[name="active"]').val()
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