unzip $DOMAIN_NAME.zip
sudo cat certificate.crt >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo echo "" >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo cat ca_bundle.crt >> /etc/nginx/ssl/nginx-ca-bundle.crt
sudo cp private.key /etc/nginx/ssl/nginx-key.key
sudo nginx -t && sudo systemctl restart nginx
