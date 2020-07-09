$( document ).ready(function() {

  //submit the form on sumit button click
  $('#submit').click(function(e) {

      var url = "/auth/aa";

      $.ajax({
           type: "POST",
           url: url,
           data: $("#agentsignin").serialize(),
           success: function(data, textStatus)
           {
              if (data.success) {
                  window.location.href = data.redirect;
              }
              else {
                  $(".login-error").html(data.message);
              }
           }
         });

         e.preventDefault();
  });

  $('#agentsignin').parsley();

});
