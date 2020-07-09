$( document ).ready(function() {

  //submit the form on sumit button click
  $('#submit').click(function(e) {

      var isValid = $("#reset_password").parsley().validate();

      if (!isValid) {
        return;
      }

      var url = "/reset_password";

      $.ajax({
           type: "POST",
           url: url,
           data: $("#reset_password").serialize(),
           success: function(data, textStatus)
           {
              if (data.success) {
                  $(".message").html(data.message);
                  $(".form_els").hide();
                  setTimeout(function() {window.location=data.redirect;}, 5000);
              }
              else {
                  $(".login-error").html(data.message);
              }
           }
         });

         e.preventDefault();
  });

  $('#reset_password').parsley();

  $('.login-btn').hide();

});
