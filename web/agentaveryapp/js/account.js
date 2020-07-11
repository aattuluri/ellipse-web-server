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
});
