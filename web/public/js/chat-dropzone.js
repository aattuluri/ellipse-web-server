var uploadedFiles = [];

var attachmentDropzone;
var modalTemplate = '<div class="modal"> \
                      <div class="modal-dialog crop-dialog"> \
                        <div class="modal-content"> \
                          <div class="modal-body"> \
                            <div class="image-container" style="max-height: 600px;overflow-y: scroll;overflow-x: hidden;"></div> \
                          </div> \
                          <div class="modal-footer"> \
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> \
                            <button type="button" class="btn btn-primary cropBtn">Crop</button> \
                          </div> \
                        </div> \
                      </div> \
                    </div>';
Dropzone.options.attachmentUploadForm = {
  paramName: "file", // The name that will be used to transfer the file
  url: 'file',
  method: 'POST',
  maxFilesize: 5, // MB
  clickable: [".dropzone", ".fileinput-button"],
  acceptedFiles: "image/png,image/jpeg,application/pdf",
  dictDefaultMessage: "Drop the files here or Click to browse (png, jpg and pdf files are allowed.)",
  autoProcessQueue: false,
  parallelUploads: 100,
  // Only two files get uploaded when autoProcessQueue is set to false
  // Please check: https://github.com/enyo/dropzone/issues/253 & https://github.com/enyo/dropzone/issues/247
  init: function() {
    attachmentDropzone = this;
    this.on("addedfile", function(file){
      /* Append child element:
        <div class="form-group">
          <input type="text" class="form-control" id="{file.name}" placeholder="">
        </div>
      */
      caption = file.caption == undefined ? "" : file.caption;
      file._captionBox = Dropzone.createElement("<div class='form-group'><textarea placeholder='Description' class='form-control caption' id='caption_"+file.name+"' type='text' name='caption_for_show' class='dropzone_caption'>"+caption+"</textarea></div>")
      file.previewElement.appendChild(file._captionBox);

      file._linksBox = Dropzone.createElement("<div class='form-group'><input placeholder='Link(Optional)' class='form-control links' id='links_"+file.name+"' type='text' name='links_for_show' class='dropzone_links' /></div>")
      file.previewElement.appendChild(file._linksBox);

      file._removeBtn = Dropzone.createElement('<span class="remove-files icon icon-circle-with-cross"></span>');
      file.previewElement.appendChild(file._removeBtn);

      $removeFileBtn = $(file.previewElement).find('.remove-files');
      $removeFileBtn.click(function(event) {
        attachmentDropzone.removeFile(file);
      })


      $fileDetails = $(file.previewElement).find('.dz-details');
      $fileDetails.click(function(event) {
        // ignore files which were already cropped and re-rendered to prevent infinite loop
        // if (file.cropped) {
        //     return;
        // }
        // cache filename to re-assign it to cropped file
        var cachedFilename = file.name;
       
        var $cropperModal = $(modalTemplate);
        var $img = $('<img style="max-width: 90%"/>');
        var $uploadCrop = $cropperModal.find('.cropBtn');

        // initialize FileReader which reads uploaded file
        var reader = new FileReader();
        reader.onloadend = function () {
            // add uploaded and read image to modal
            $cropperModal.find('.image-container').html($img);
            $img.attr('src', reader.result);
            // initialize cropper for uploaded image
            $img.cropper({
                aspectRatio: 1.91 / 1,
                strict: true,
                guides: false,
                dragCrop: false,
                movable: false,
                autoCropArea: 1,
                cropBoxResizable: true,
                built: function () {
                  var containerData = $img.cropper('getContainerData');
                  $img.cropper('setCropBoxData', {
                    width: containerData.width,
                  })
                }
            });
        };
        // read uploaded file (triggers code above)
        reader.readAsDataURL(file);

        $cropperModal.modal('show');

        // listener for 'Crop and Upload' button in modal
        $uploadCrop.unbind('click').on('click', function() {
          // get cropped image data
          var blob = $img.cropper('getCroppedCanvas').toDataURL();
          // transform it to Blob object
          var newFile = dataURItoBlob(blob);
          // set 'cropped to true' (so that we don't get to that listener again)
          // newFile.cropped = true;
          // assign original filename
          newFile.name = cachedFilename;
          attachmentDropzone.removeFile(file);
          // add cropped file to dropzone
          attachmentDropzone.addFile(newFile);
          $cropperModal.modal('hide');
        });
      })
    });

    this.on("sending", function(file, xhr, formData) {
      formData.append("description", document.getElementById("caption_" + file.name).value);
      formData.append("link", document.getElementById("links_" + file.name).value);
    });

    this.on("success", function(file, response) {

      console.log("Uploaded file, server response: " + JSON.stringify(response));
      uploadedFiles.push(response);
    });

    this.on("queuecomplete", function(file, response) {
      //send all files to chat
      console.log("All the files uploaded!");
      var chatId = getParameterByName('id');
      socket.emit('io:msg', {c: chatId, f: uploadedFiles});
      uploadedFiles = [];
      attachmentDropzone.removeAllFiles();
      $('.image-upload-panel').removeClass('is-visible');
			$('.container').removeClass('position-fixed');
    });
  }
};

$('#upload-image-btn').on('click', function(event) {
  $('#upload-image-form').submit();
  attachmentDropzone.processQueue();
});


// transform cropper dataURI output to a Blob which Dropzone accepts
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}