#!/usr/bin/env bash

sudo certbot renew
sudo nginx -t && sudo systemctl restart nginx
