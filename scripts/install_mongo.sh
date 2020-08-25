#!/bin/bash
echo "Y" | sudo apt install -y mongodb
sudo systemctl status mongodb
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
sudo sed -i 's/#auth\s=\strue/auth = true/g' /etc/mongodb.conf
sudo systemctl restart mongodb
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
