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
CANISTER_ID_STORAGE=$(grep CANISTER_ID_STORAGE "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_PROFILE=$(grep CANISTER_ID_PROFILE "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_PERMISSION=$(grep CANISTER_ID_PERMISSION "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_ORGANIZATION=$(grep CANISTER_ID_ORGANIZATION "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_INTERNET_IDENTITY=$(grep CANISTER_ID_INTERNET_IDENTITY "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")
CANISTER_ID_IC_SIWE_PROVIDER=$(grep CANISTER_ID_IC_SIWE_PROVIDER "$ENV_PATH" | cut -d '=' -f2 | sed "s/^'//; s/'$//")

# Perform the substitutions using sed
sed -i "" "s/DFX_NETWORK=.*$/DFX_NETWORK=$DFX_NETWORK/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_STORAGE=.*$/REACT_APP_CANISTER_ID_STORAGE=$CANISTER_ID_STORAGE/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_PROFILE=.*$/REACT_APP_CANISTER_ID_PROFILE=$CANISTER_ID_PROFILE/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_PERMISSION=.*$/REACT_APP_CANISTER_ID_PERMISSION=$CANISTER_ID_PERMISSION/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_ORGANIZATION=.*$/REACT_APP_CANISTER_ID_ORGANIZATION=$CANISTER_ID_ORGANIZATION/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_INTERNET_IDENTITY=.*$/REACT_APP_CANISTER_ID_INTERNET_IDENTITY=$CANISTER_ID_INTERNET_IDENTITY/" .env
sed -i "" "s/REACT_APP_CANISTER_ID_IC_SIWE_PROVIDER=.*$/REACT_APP_CANISTER_ID_IC_SIWE_PROVIDER=$CANISTER_ID_IC_SIWE_PROVIDER/" .env
