var uploadedFiles = [];

var attachmentDropzone;

Dropzone.options.attachmentUploadForm = {
  paramName: "file", // The name that will be used to transfer the file
  url: 'file',
  method: 'POST',
  maxFilesize: 5, // MB
  clickable: [".dropzone", ".fileinput-button"],
  acceptedFiles: "image/png,image/jpeg,application/pdf",
  dictDefaultMessage: "Drop the files here or Click to browse (png, jpg and pdf files are allowed.)",
  autoProcessQueue: false,
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

      // $(file.previewElement).addClass('col-xs-3');
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

// $('.file-scroll').click(function() {
//   $('#attachment-upload-form').animate({
//     scrollTop: $('.dz-preview').eq(5).offset().top
//   }, 2000);
// });



//previewTemplate: '<div class="dz-preview dz-file-preview"><div class="dz-details"><div class="dz-filename"><span data-dz-name></span></div><div class="dz-size" data-dz-size></div><img data-dz-thumbnail /></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div><div class="dz-success-mark"><span>✔</span></div><div class="dz-error-mark"><span>✘</span></div><div class="dz-error-message"><span data-dz-errormessage></span></div><input type="text" placeholder="Title"/></div>'
