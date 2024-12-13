#!/bin/bash

awk -F= '/^[[:alpha:]]/ {a[$1]=$2}END{for(i in a) print i "=" a[i]}' .env.ci $ENV_FILE > .env

cat .env