$( document ).ready(function() {

  //submit the form on sumit button click
  $('#submit').click(function(e) {

      var isValid = $("#forgot_password").parsley().validate();

      if (!isValid) {
        return;
      }

      var url = "/forgot_password";

      $.ajax({
           type: "POST",
           url: url,
           data: $("#forgot_password").serialize(),
           success: function(data, textStatus)
           {
              if (data.success) {
                  $(".message").html(data.message);
                  $(".form_els").hide();
              }
              else {
                  $(".login-error").html(data.message);
              }
           }
         });

         e.preventDefault();
  });

  $('#forgot_password').parsley();

});
