$( document ).ready(function() {

  var profilePictureDropzone;

  var newImageId;
  var newImagePath;

  var oldImagePath = $('img.profile-picture').attr('src');
  $(".profile-picture-confirm").hide();

  $('.profile-picture-edit').dropzone({
      url: '/file',
      uploadMultiple: false,
      paramName: "file", // The name that will be used to transfer the file
      maxFilesize: 5, // MB
      acceptedFiles: "image/png,image/jpeg",
      previewsContainer: 'img.profile-picture',
      init: function() {
        profilePictureDropzone = this;
        this.on("success", function(file, response) {
          //update the existing image
          newImageId = response.id;
          newImagePath = '/file/' + response.id;
          $('img.profile-picture').attr('src', newImagePath);
          $('img.profile-picture').css({ opacity: 0.3 });
          //show the ok and cancel icons on the top of the message
          $(".profile-picture-confirm").show();
          $(".profile-picture-edit").hide();
        });
      }
  });

  $(".profile-picture-ok").on('click', function (event) {
    $.ajax({
      url: '/user/picture',
      type: 'POST',
      dataType: "json",
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({file: newImagePath}),
      success: function(response, textStatus, jqXHR) {
        if (response.success &&
              response.success === true) {
          //TBD: show 'Profile pic saved' message that fades out
          oldImagePath = $('img.profile-picture').attr('src');
          newImageId = null;
          newImagePath = null;
          $(".profile-picture-confirm").hide();
          $(".profile-picture-edit").show();
          $('img.profile-picture').css({ opacity: 1.0 });
        } else {
          //TBD: show 'Profile pic save failed' message
        }
      },
      error: function(jqXHR, textStatus, errorThrown){
        //TBD: show 'Profile pic save failed' message
      }
    });
  });

  $(".profile-picture-cancel").on('click', function (event) {
    //Revert back to old message
    $('img.profile-picture').attr('src', oldImagePath);
    $('img.profile-picture').css({ opacity: 1.0 });
    $(".profile-picture-confirm").hide();
    $(".profile-picture-edit").show();
    $.ajax({
      url: '/file/' + newImageId,
      type: 'DELETE',
      success: function(response, textStatus, jqXHR) {
        if (response.success &&
              response.success === true) {
            //do nothing
        } else {
            //do nothing
        }
      },
      error: function(jqXHR, textStatus, errorThrown){
        //do nothing
      }
    });
  });

  //confirmation dialogs
  $('#actionConfirmationDialog').on('show.bs.modal', function (event) {
    var a = $(event.relatedTarget);
	  var title = a.text();
    var className = a.attr('class');
    var modal = $(this);
    var path = className;
    modal.find('.modal-title').text(title);
    modal.find('.confirm-action').attr('data-path', path);
    modal.find('.confirm-action').on('click', function (evt) {
      $.ajax({
          url: '/agent/' + path,
          type: 'GET',
          success: function(response, textStatus, jqXHR) {
            if (response.success &&
                  response.success === true) {
                //TBD: force reload the page for now
                window.location.reload(true);
                $('#actionConfirmationDialog').modal('hide');
            } else {
                $('#actionConfirmationDialog').modal('hide');
            }
          },
          error: function(jqXHR, textStatus, errorThrown){
            $('#actionConfirmationDialog').modal('hide');
          }
       });
    });
    //TBD: add action handler for the confirm button based on class
	});

  $('#agent-profile-tab a').click(function (e) {
    e.preventDefault()
    $('.profile-form .tips').remove();
    $(this).tab('show')
  })

  $('.profile-form .add-input').keypress(function(evt) {
    if (evt.keyCode == 13) {
      addItem($(this))
    }
  })
  // Add items
  $('.profile-form .add-items').on('click', function(evt) {
    addItem($(this))
  })

  function addItem($this) {
    var currentField = $this.data('field');
    var $currentField = $('.profile-form .' + currentField);
    var fieldVal = $currentField.val();
    if (fieldVal === '') return;
    $('.profile-form .' + currentField + '-items').append('<p class="label label-success item"><span class="item-val">' + fieldVal + '</span></p>');
    $currentField.val("");
    removeItem();
  }

  // Remove items
  removeItem();
  function removeItem() {
    var $items = $('.specialities-items .item, .destinations-items .item');
    $items.hover(function(evt){
      $items.find('.ti-close').remove();
      $(this).append('<span class="ti-close"></span>');
      $(this).find('.ti-close').on('click', function(evt) {
        $(this).parent('p').remove();
      })
    })
  }

  $('.profile-form .start-time').on("change",function(){
    var theSelectedIndex = $(this)[0].selectedIndex;
    $.each($('.profile-form .end-time option'), function(){
        var endOptionIndex = $(this).index();
        if (endOptionIndex < theSelectedIndex){
           $(this).attr('disabled','disabled');
        } else{
           $(this).removeAttr('disabled').prop('selected', true);
           return false;
        }
    });
  });

  $('.profile-form .update-profile').on('click', function(evt){
    var fields = ['email', 'destinations', 'specialities', 'phone', 'cLIANumber', 'aRCNumber', 'iATANumber', 'aboutMe'];
    var postData = {};
    fields.forEach(function(item){
      if (["destinations", "specialities"].indexOf(item) !== -1) {
        postData[item] = $('.profile-form .' + item + '-items .item-val').map(function(){ 
            return $(this).text(); 
        }).get().join(';')
      } else {
        if (item == 'phone') {
          postData[item] = {};
          postData[item]["mobile"] = $('.profile-form .' + item).val()
        } else {
          postData[item] = $('.profile-form .' + item).val()
        }
      }
    })
    
    var phone = postData.phone.mobile;
    if (phone.length  != 10 || !/^\d+$/.test(phone)){
      var errorMsg = ' Please enter a valid phone number :), eg. 2223334444 ';
      $('.tab-pane.active').before('<p class="tips label-danger text-center">'+errorMsg+'<p>');
      setTimeout(function(){
        $('.profile-form .tips').remove();
      }, 3000);
      return;
    }
   
    updateAccount(postData);
  });

  $('.profile-form .save-settings').on('click', function(){
    var postData = {};
    var timeZone = $('.profile-form .timezone').val();
    var availability = {
      enabled: true,
      oooMessage: $('.profile-form .message').val(),
    }
    $('.profile-form .weekday:checked').each(function(){
      var currentDay = $(this).val();
      var startTime = $('.profile-form .start-time.' + currentDay).val();
      var endTime = $('.profile-form .end-time.' + currentDay).val();

      availability[currentDay] = {
        start: startTime,
        end: endTime
      }
    })
    postData['timeZone'] = timeZone;
    postData['availability'] = availability;
    // Use API (POST /agent/account) with JSON 
    // = {timeZone: “XXX”, 
    // availability: {“enabled”: true, Monday: {“startTime”: “8:00 AM”, “endTime”: “5:00 PM”}}    
    updateAccount(postData);
  });
  $('.profile-form .disable-settings').on('click', function(){
    var postData = {
      availability: {
        enabled: false
      }
    };
    updateAccount(postData);
  });

  function updateAccount(postData){
    $.ajax({
      async: false,
      url: '/agent/account',
      type: "POST",
      data: postData,
      dataType : "json",
      timeout: 8000,
      beforeSend: function(jqXHR, settings){
        // console.log("Haven't entered server side yet.");
      },
      success: function (result) {
        $('.profile-form .tips').remove();
        if (result.success) {
          $('.tab-pane.active').before('<p class="tips label-success text-center">Update Successful!<p>');
        } else {
          $('.tab-pane.active').before('<p class="tips label-warning text-center">'+ result.message +'<p>');
        }
        setTimeout(function(){
          $('.profile-form .tips').remove();
        }, 3000);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }
});
