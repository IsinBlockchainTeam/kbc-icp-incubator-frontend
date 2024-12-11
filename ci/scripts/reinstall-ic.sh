#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

cd ..

# Ping dfx network
dfx ping ic

# Source .env
set -o allexport
source .env
set +o allexport

dfx canister install kbc-platform --mode reinstall --network ic --yes

# Canister status
dfx canister status kbc-platform --network ic
