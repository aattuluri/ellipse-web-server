#!/bin/bash
echo "Y" | sudo apt install nginx
sudo ufw allow 'Nginx HTTPS'
sudo ufw status
systemctl status nginx
sudo mkdir -p /var/www/$DOMAIN_NAME/html
sudo chown -R $USER:$USER /var/www/$DOMAIN_NAME/html
sudo chmod -R 755 /var/www/$DOMAIN_NAME
