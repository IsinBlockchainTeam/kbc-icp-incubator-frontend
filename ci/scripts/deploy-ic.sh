#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

cd ../src

# Ping dfx network
dfx ping ic

# Source .env
set -o allexport
source .env
set +o allexport

dfx deploy kbc-platform --network ic --yes

# Canister status
dfx canister status kbc-platform --network ic
