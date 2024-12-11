#!/bin/bash

cat .env.ci
cat $ENV_FILE

awk 'NF {if ($0 ~ /^[^#]/) {key = substr($0, 1, index($0, "=") - 1); if (!seen[key]++) {print $0}} else {print $0}}' .env.ci $ENV_FILE > .env

cat .env