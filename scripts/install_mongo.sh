#!/bin/bash
echo "Y" | sudo apt install -y mongodb
sudo systemctl status mongodb
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
