#!/bin/bash
echo "Y" | sudo apt install nodejs
echo "Y" | install npm
nodejs -v
npm install pm2 -g
