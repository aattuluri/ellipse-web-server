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
});
