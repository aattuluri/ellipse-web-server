#!/usr/bin/env bash

BUILD_ID=`date +%s`
DEPLOY_ROOT="/srv/aa"
BUILD_DIR="$DEPLOY_ROOT/$BUILD_ID"

MODULES_CACHE_WEB="$DEPLOY_ROOT/node_modules_web.tar"
MODULES_CACHE_USERAPP="$DEPLOY_ROOT/node_modules_userapp.tar"
MODULES_CACHE_AGENTAVERYAPP="$DEPLOY_ROOT/node_modules_agentaveryapp.tar"

SCRIPT_PWD=`pwd`

function build_web {
  echo "Building web"
  cd $BUILD_DIR
  sudo -u deploy tar xf $MODULES_CACHE_WEB
  sudo -u deploy ln -s /srv/aa/localConfig.json $BUILD_DIR/localConfig.json
  sudo -u deploy npm prune
  sudo -u deploy npm install
  sudo -u deploy npm install string-format moment-timezone html-pdf
  sudo -u deploy tar cf $MODULES_CACHE_WEB node_modules
}

function build_userapp {
  echo "Building userapp"
  cd $BUILD_DIR/userapp
  sudo -u deploy tar xf $MODULES_CACHE_USERAPP
  sudo -u deploy npm prune
  sudo -u deploy npm install
  sudo -u deploy npm run build \
    && sudo -u deploy tar cf $MODULES_CACHE_USERAPP node_modules
}

function build_agentaveryapp {
  echo "Building agentaveryapp"
  cd $BUILD_DIR/agentaveryapp
  sudo -u deploy tar xf $MODULES_CACHE_AGENTAVERYAPP
  sudo -u deploy npm prune
  sudo -u deploy npm install
  sudo -u deploy npm run build \
    && sudo -u deploy tar cf $MODULES_CACHE_AGENTAVERYAPP node_modules
}

cd $DEPLOY_ROOT

# Pull latest changes.
sudo -u deploy mkdir -p $BUILD_DIR
sudo -u deploy git clone --branch master --depth 1 https://github.com/agentavery/web $BUILD_DIR

# Build artifacts.
build_web
build_userapp
build_agentaveryapp

# Restart node process.
cd $BUILD_DIR
sudo pm2 delete agentavery
sudo pm2 --node-args --harmony_destructuring start agentavery.js

# Update current symlink
sudo -u deploy rm /srv/aa/current
sudo -u deploy ln -s $BUILD_DIR /srv/aa/current
cd $SCRIPT_PWD
