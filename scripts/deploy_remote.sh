#!/usr/bin/env bash

BUILD_ID=`date +%s`
DEPLOY_ROOT="/srv/aa"
BUILD_DIR="$DEPLOY_ROOT/$BUILD_ID"

MODULES_CACHE_WEB="$DEPLOY_ROOT/node_modules_ui.tar"
MODULES_CACHE_ELLIPSEWEBSERVER="$DEPLOY_ROOT/node_modules_ellipse-web-server.tar"

SCRIPT_PWD=`pwd`

function build_ui {
  #TODO
  #echo "Building UI"
  #cd $BUILD_DIR
  #sudo -u deploy tar xf $MODULES_CACHE_WEB
  #sudo -u deploy ln -s /srv/aa/localConfig.json $BUILD_DIR/localConfig.json
  #sudo -u deploy npm prune
  #sudo -u deploy npm install
  #sudo -u deploy npm install string-format moment-timezone html-pdf
  #sudo -u deploy tar cf $MODULES_CACHE_WEB node_modules
}

function build_ellipse_web_server {
  echo "Building ellipseapp web server"
  cd $BUILD_DIR/ellipse-web-server
  sudo -u deploy tar xf $MODULES_CACHE_ELLIPSEWEBSERVER
  sudo -u deploy npm prune
  sudo -u deploy npm install
  sudo -u deploy npm run build \
    && sudo -u deploy tar cf $MODULES_CACHE_ELLIPSEWEBSERVER node_modules
}

cd $DEPLOY_ROOT

# Pull latest changes.
sudo -u deploy mkdir -p $BUILD_DIR
sudo -u deploy git clone --branch master --depth 1 https://github.com/aattuluri/ellipse-web-server.git $BUILD_DIR

# Build artifacts.
build_ui
build_ellipse_web_server

# Restart node process.
cd $BUILD_DIR
sudo pm2 delete app
sudo pm2 --node-args --harmony_destructuring start app.js

# Update current symlink
sudo -u deploy rm /srv/aa/current
sudo -u deploy ln -s $BUILD_DIR /srv/aa/current
cd $SCRIPT_PWD
