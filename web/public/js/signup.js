$( document ).ready(function() {

  //submit the form on sumit button click
  $('#submit').click(function() {
    $('#agentsignup').submit();
  });

  $('#agentsignup').parsley();

  //add the destinations and specialities as comma separated hidden params to the form
  $("#agentsignup").submit( function(eventObj) {
    $('<input />').attr('type', 'hidden')
            .attr('name', "destinations")
            .attr('value', getTags("destinations"))
            .appendTo('#agentsignup');
    $('<input />').attr('type', 'hidden')
            .attr('name', "specialities")
            .attr('value', getTags("specialities"))
            .appendTo('#agentsignup');
    ga('send', 'event', "NewUserRegistered", "Agent");
  });

  //handler for little X for each tag
  $('div.tags-group').on('click', 'span.tags-rmv.ti-close', function() { $(this).closest("span.tags").remove(); });

  //on ENTER add the tag to the list
  $("#destinations").keyup(function (e) {
      if (e.keyCode == 13) {
          addTag ($(this), 'destinations');
      }
  });

  //on ENTER add the tag to the list
  $("#specialities").keyup(function (e) {
      if (e.keyCode == 13) {
          addTag ($(this), 'specialities');
      }
  });

  //add the new tags to the UI
  function addTag (el, name) {
      var val = el.val();
      if (!val) return;
      $("div.tags-group."+name).append('<span class="tags"><span class="tag-txt">'+
          val +'</span><span class="tags-rmv ti-close"></span></span>');
      el.val("");
  }

  function getTags(name) {
      var tagArr = [];
      $("div.tags-group." + name + " span.tag-txt").each(function(index, elem){
          tagArr.push($(this).text());
      });
      return tagArr.join(",");
  }

});
