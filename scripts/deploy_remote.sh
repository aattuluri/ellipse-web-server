#!/usr/bin/env bash

BUILD_ID=`date +%s`
DEPLOY_ROOT="/srv/ellipseapp"
BUILD_DIR="$DEPLOY_ROOT/$BUILD_ID"
APP_DIR="$BUILD_DIR/ellipse-web-server"

MODULES_CACHE_WEB="$DEPLOY_ROOT/node_modules_ui.tar"
MODULES_CACHE_ELLIPSEWEBSERVER="$DEPLOY_ROOT/node_modules_ellipse-web-server.tar"

SCRIPT_PWD=`pwd`

#function build_ui {
  #TODO
  #echo "Building UI"
  #cd $BUILD_DIR
  #sudo -u deploy tar xf $MODULES_CACHE_WEB
  #sudo -u deploy ln -s /srv/ellipseapp/localConfig.json $BUILD_DIR/localConfig.json
  #sudo -u deploy npm prune
  #sudo -u deploy npm install
  #sudo -u deploy npm install string-format moment-timezone html-pdf
  #sudo -u deploy tar cf $MODULES_CACHE_WEB node_modules
#}

function build_ellipse_web_server {
  echo "Building ellipseapp web server"
  cd $APP_DIR
  npm prune
  npm install
}

cd $DEPLOY_ROOT

# Pull latest changes.
mkdir -p $APP_DIR
git clone --branch master --depth 1 git@github.com:aattuluri/ellipse-web-server $APP_DIR

# Build artifacts.
#build_ui
build_ellipse_web_server

# Restart node process.
cd $APP_DIR
pm2 delete app
pm2 start app.js

# Update current symlink
rm /srv/ellipseapp/current
ln -sf $BUILD_DIR /srv/ellipseapp/current
cd $SCRIPT_PWD
