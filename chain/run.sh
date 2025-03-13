#!/bin/bash

# Exit script on any error
set -e

# Compile the contracts
echo "Compiling contracts..."
forge build
DEPLOYMENT_SCRIPTS=$(find scripts/ -name "*.s.sol")

# Start Anvil with a 3-second block time
anvil --block-time 3 &> anvil.log &
ANVIL_PID=$!
echo "Anvil started with PID $ANVIL_PID"

# Trap Ctrl+C and cleanup
cleanup() {
  echo "Shutting down Anvil..."
  kill $ANVIL_PID
  exit 0
}
trap cleanup SIGINT
trap cleanup EXIT

# Wait for Anvil to be ready
sleep 2

# Deploy compiled contracts
echo "Deploying contracts..."
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Default Anvil key
SALT="0x12345678" # used for deterministic deployments

DEPLOYED_ADDRESSES=()
for FILE in $DEPLOYMENT_SCRIPTS; do

  echo "Deploying $CONTRACT_NAME..."
  forge script $FILE --slow --multi --broadcast --private-key $PRIVATE_KEY --verify
  if [[ -n "$ADDRESS" ]]; then
    DEPLOYED_ADDRESSES+=("$CONTRACT_NAME: $ADDRESS")
  fi
done

wait $ANVIL_PID

