#!/usr/bin/env bash

if [ "staging" == "$1" ]; then
  REMOTE_HOST='139.59.16.53'
elif [ "production" == "$1" ]; then
  REMOTE_HOST='128.199.24.169'
else
  echo "Please specify environment = staging|production"
  exit 1
fi

echo "Deploying to $1"
ssh -t $REMOTE_HOST "$(<$(dirname $0)/deploy_remote.sh)"
