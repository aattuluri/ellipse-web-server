$( document ).ready(function() {

  CKEDITOR.replace( 'itineraryEditor', {
    extraPlugins: 'uploadimage,dragresize',
    toolbar: 'Basic',
    imageUploadUrl: '/ckeditor/image',
    height: 450,
    removeButtons: 'Save,Superscript,Subscript,DecreaseIndent,IncreaseIndent,Insert a ZS Google map',
    removePlugins: 'autosave,gg,image2'
  });

  window.advancedEditor = CKEDITOR.instances.itineraryEditor;

});
