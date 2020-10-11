#!/usr/bin/env bash

BUILD_ID=`date +%s`
DEPLOY_ROOT="/srv/ellipseapp"
BUILD_DIR="$DEPLOY_ROOT/$BUILD_ID"
APP_DIR="$BUILD_DIR/ellipse-web-server"
UI_DIR="$BUILD_DIR/ellipse-web-ui"
ADMIN_DIR="$BUILD_DIR/ellipse-admin-ui"

SCRIPT_PWD=`pwd`

function build_ellipse_web_server {
  echo "Building ellipseapp web server"
  cd $APP_DIR
  npm prune
  npm install
  npm build
}

cd $DEPLOY_ROOT

# Pull latest changes.
mkdir -p $APP_DIR
git clone --branch master --depth 1 git@github.com:aattuluri/ellipse-web-server $APP_DIR

mkdir -p $UI_DIR
git clone --branch master --depth 1 git@github.com:aattuluri/ellipse-web-ui $UI_DIR

mkdir -p $ADMIN_DIR
git clone --branch master --depth 1 git@github.com:aattuluri/ellipse-admin-ui $ADMIN_DIR

# Build artifacts.
build_ellipse_web_server

# Restart nodejs web server process.
cd $APP_DIR
pm2 delete app
pm2 start app.js

# Copy ui build
cd $UI_DIR
cp -R ./build/* /var/www/$DOMAIN_NAME/html

# Copy admin build
cd $ADMIN_DIR
cp -R ./build/* /var/www/$DOMAIN_NAME/admin/html

# Update current symlink
rm /srv/ellipseapp/current
ln -sf $BUILD_DIR /srv/ellipseapp/current
cd $SCRIPT_PWD
