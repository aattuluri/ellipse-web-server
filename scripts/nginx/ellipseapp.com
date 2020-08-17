server {
    listen 443 ssl;
    listen [::]:443 ssl;
    include snippets/certs.conf;
    include snippets/ssl-params.conf;

    server_name ellipseapp.com www.ellipseapp.com;

    root /var/www/ellipseapp.com/html;
    index index.html index.htm index.nginx-debian.html;

}

server {
    listen 80;
    listen [::]:80;

    server_name ellipseapp.com www.ellipseapp.com;

    return 302 https://$server_name$request_uri;
}
