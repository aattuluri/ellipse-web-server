$( document ).ready(function() {
  var source = getParameterByName('s');
  ga('send', 'event', 'PageView', 'LandingPage', source);
  //track the click via facebook pixel
  $('.lets-get-started').click(function() {
      ga('send', 'event', 'ButtonClick', 'LetsGetStarted', source);
      var sourceParam = "";
      if (source) {
        sourceParam = "?s=" + source;
      }
      window.location = "/userapp"+sourceParam+"#/signup";
  });

  var currentPath = window.location.pathname;
  if (/\/profile\//.test(currentPath)) {
    // Get /agent/profile
    $.ajax({
      async: false,
      url: '/public/agent' + window.location.pathname,
      type: "GET",
      dataType : "json",
      timeout: 8000,
      beforeSend: function(jqXHR, settings){
        // console.log("Haven't entered server side yet.");
      },
      success: function (result) {
        // if (result._id != undefined && !result.success) {
        //   $('.agent-profile .avatar').after('<p class="tips label-warning text-center">'+ result.message +'</p>');
        // }
        $('.agent-profile .agent-avatar').attr('src', result.image);
        $('.agent-profile .agent-name').text(result.firstName + ' ' + result.lastName);
        $('.agent-profile .aboutMe').html(result.aboutMe.replace(/\r?\n/g, '<br />'));
        
        ['specialities', 'destinations'].forEach(function(item){
          var fieldVal = result[item].split(";");
          var fieldEle = '';
          if (fieldVal.length > 0) {
            fieldEle = fieldVal.map(function(val) {
              if (val == '') { return; }
              return '<p><span class="item">'+val+'</span></p>';
            }).join('');
          }
          $('.agent-profile .' + item + '-inner').html(fieldEle);
        });
        
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }
});
