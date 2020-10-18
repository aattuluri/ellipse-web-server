#!/bin/bash
echo "Y" | sudo apt install unzip
./install_redis.sh
./install_mongo.sh
./install_nginx.sh
./install_node_utils.sh
./nginx_conf.sh
