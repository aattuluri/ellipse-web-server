#!/bin/bash
sudo cp ./nginx/$DOMAIN_NAME /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
sudo mkdir /etc/nginx/ssl
sudo chown -R root:root /etc/nginx/ssl
sudo chmod -R 600 /etc/nginx/ssl
sudo cp ./nginx/certs.conf /etc/nginx/snippets/
sudo cp ./nginx/ssl-params.conf /etc/nginx/snippets/
sudo openssl dhparam -out /etc/nginx/ssl.crt/dhparam.pem 2048;
#Copy certs/key to /etc/nginx/ssl
echo "Y" | sudo apt install unzip
unzip $DOMAIN_NAME.zip
sudo cat certificate.crt >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo cat "\n" >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo cat ca_bundle.crt >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo cp private.key >> /etc/nginx/ssl/nginx-key.key
sudo nginx -t && sudo systemctl restart nginx
