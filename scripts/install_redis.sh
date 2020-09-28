#!/bin/bash
echo "Y" | sudo apt install redis-server
sudo sed -i 's/supervised\sno/supervised systemd/g' /etc/redis/redis.conf
sudo systemctl restart redis.service
