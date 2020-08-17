server {
    listen 443 ssl;
    listen [::]:443 ssl;
    include snippets/certs.conf;
    include snippets/ssl-params.conf;

    server_name staging.ellipseapp.com www.staging.ellipseapp.com;

    root /var/www/staging.ellipseapp.com/html;
    index index.html index.htm index.nginx-debian.html;
    
    location /api {
        proxy_pass http://127.0.0.1:4000;
    }

}

server {
    listen 80;
    listen [::]:80;

    server_name staging.ellipseapp.com www.staging.ellipseapp.com;

    return 302 https://$server_name$request_uri;
}
