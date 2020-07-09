#!/usr/bin/env bash

if [ "staging" == "$1" ]; then
  REMOTE_HOST='159.203.224.4'
elif [ "production" == "$1" ]; then
  REMOTE_HOST='159.203.223.58'
else
  echo "Please specify environment = staging|production"
  exit 1
fi

echo "Deploying to $1"
ssh -t $REMOTE_HOST "$(<$(dirname $0)/deploy_remote.sh)"
