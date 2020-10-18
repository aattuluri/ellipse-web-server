#!/bin/bash
sudo cp ./nginx/$DOMAIN_NAME /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
sudo cp ./nginx/admin.$DOMAIN_NAME /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/admin.$DOMAIN_NAME /etc/nginx/sites-enabled/
sudo mkdir /etc/nginx/ssl
sudo chown -R root:root /etc/nginx/ssl
sudo chmod -R 600 /etc/nginx/ssl
sudo cp ./nginx/certs.conf /etc/nginx/snippets/
sudo cp ./nginx/ssl-params.conf /etc/nginx/snippets/
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048;
