#!/bin/bash

# Get the directory containing the script
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Set the working directory relative to the root of the project
cd "$SCRIPT_DIR/.."

# Check if REACT_APP_CANISTER_ENV_GLOB is defined in .env
ENV_PATH=$(grep REACT_APP_CANISTER_ENV_GLOB .env | cut -d '=' -f2)
if [ -z "$ENV_PATH" ]; then
  echo "REACT_APP_CANISTER_ENV_GLOB not found in .env"
  exit 1
fi

# Get the values of environment variables from the specified file, removing single quotes if present
DFX_NETWORK=$(grep DFX_NETWORK "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_INTERNET_IDENTITY=$(grep CANISTER_ID_INTERNET_IDENTITY "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")

# Perform the substitutions using sed
sed -i "s/REACT_APP_DFX_NETWORK=.*$/REACT_APP_DFX_NETWORK=$DFX_NETWORK/" .env
sed -i "s/REACT_APP_CANISTER_ID_INTERNET_IDENTITY=.*$/REACT_APP_CANISTER_ID_INTERNET_IDENTITY=$CANISTER_ID_INTERNET_IDENTITY/" .env
