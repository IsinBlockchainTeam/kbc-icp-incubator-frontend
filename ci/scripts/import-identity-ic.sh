#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

# Import identity
# --storage-mode plaintext is used to store the identity in plaintext, useful for CI/CD
dfx identity import ci-cd "$CI_CD_ICP_IDENTITY_PEM" --storage-mode plaintext
dfx identity list
dfx identity use ci-cd

# Set wallet
dfx identity set-wallet $CI_CD_ICP_WALLET --ic
dfx wallet balance --ic