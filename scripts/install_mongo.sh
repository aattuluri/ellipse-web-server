#!/bin/bash
echo "Y" | sudo apt install -y mongodb
sudo systemctl status mongodb
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
mongo <<EOF
use admin
db.createUser({user: "Ellipse", pwd: "Ellipse2020",roles: [ { role: "userAdminAnyDatabase", db: "admin"} ]})
EOF
sudo sed -i 's/#auth\s=\strue/auth = true/g' /etc/mongodb.conf
sudo systemctl restart mongodb
mongo admin -u Ellipse -p 'Ellipse2020' <<EOF
use ellipseDB
db.createUser({ user: "EllipseApp", pwd: "EllipseApp2020", roles: ["readWrite"] })
EOF
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
