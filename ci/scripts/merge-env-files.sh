#!/bin/bash

awk -F = '!/^#/ {a[$1]=$2}END{for(i in a) print i "=" a[i]}' .env.ci $ENV_FILE > .env

cat .env