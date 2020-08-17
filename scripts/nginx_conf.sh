#!/bin/bash
sudo cp ./nginx/ellipseapp.com /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/ellipseapp.com /etc/nginx/sites-enabled/
sudo mkdir /etc/nginx/ssl
sudo chown -R root:root /etc/nginx/ssl
sudo chmod -R 600 /etc/nginx/ssl
sudo cp ./nginx/certs.conf /etc/nginx/snippets/
sudo cp ./nginx/ssl-params.conf /etc/nginx/snippets/
sudo openssl dhparam -out /etc/nginx/ssl.crt/dhparam.pem 2048;
#Copy certs/key to /etc/nginx/ssl
sudo nginx -t && sudo systemctl restart nginx
