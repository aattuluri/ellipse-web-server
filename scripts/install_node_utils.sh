#!/bin/bash
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.profile
nvm install 12.18.3
echo "Y" | install npm
npm install pm2 -g
