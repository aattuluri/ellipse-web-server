$( document ).ready(function() {

  //submit the form on sumit button click
  $('#submit').click(function() {
    $('#agent_agreement').submit();
  });

  $('#agent_agreement').parsley();

});
