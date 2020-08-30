server {
    listen 443 ssl;
    listen [::]:443 ssl;
    include snippets/certs.conf;
    include snippets/ssl-params.conf;

    server_name ellipseapp.com www.ellipseapp.com;

    root /var/www/ellipseapp.com/html;
    index index.html index.htm index.nginx-debian.html;
    
    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:4000;
    }
    
    location /ws {
        rewrite  ^/ws/(.*) /$1 break; 
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }
    
}

server {
    listen 80;
    listen [::]:80;

    server_name ellipseapp.com www.ellipseapp.com;

    return 302 https://$server_name$request_uri;
}
