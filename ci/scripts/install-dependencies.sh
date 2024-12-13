#!/bin/bash

# Install Cargo
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install dfx
export DFXVM_INIT_YES=true
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add cargo and dfx to PATH
export PATH=$PATH:/root/.local/share/dfx/bin:/root/.cargo/bin

# Add wasm target
rustup target add wasm32-unknown-unknown

# Verify installation
cargo --version
dfx --version