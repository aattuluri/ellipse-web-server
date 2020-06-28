function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

loadjscssfile("https://getbootstrap.com/dist/css/bootstrap.min.css", "css");
loadjscssfile("https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css", "css");
loadjscssfile("https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.4/socket.io.min.js", "js");
loadjscssfile("https://agentavery.com/dist/aa-chat-plugin.js", "js");
var elem = document.createElement("div");
elem.id = 'aa_chat_plugin';
elem.innerHTML = ''
document.body.insertBefore(elem,document.body.childNodes[0]);
