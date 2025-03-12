#!/bin/bash

# Exit script on any error
set -e
set FOUNDRY_DISABLE_NIGHTLY_WARNING=true

# Compile the contracts
echo "Compiling contracts..."
forge build
CONTRACT_FILES=$(find out/ -name "*.json" | grep -v metadata)

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
DEPLOYER="0x4e59b44847b379578588920ca78fbf26c0b4956c" # Anvil's built-in deployer
MY_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Default Anvil key
SALT="0x12345678" # used for deterministic deployments

DEPLOYED_ADDRESSES=()
for FILE in $CONTRACT_FILES; do
  CONTRACT_NAME=$(basename "$FILE" .json)
  BYTECODE=$(jq -r '.bytecode.object' "$FILE")

  if [[ "$BYTECODE" == "null" || -z "$BYTECODE" ]]; then
    #echo "Skipping $CONTRACT_NAME (no bytecode found)"
    continue
  fi


  echo "Deploying $CONTRACT_NAME..."
  forge create --private-key $PRIVATE_KEY src
  OUTPUT=$(cast send $DEPLOYER "function deploy(bytes,uint256) returns (address)" "$BYTECODE" "$SALT" --private-key $PRIVATE_KEY)
  SALT_BYTES=$(cast --to-bytes32 $SALT)
  BYTECODE_HASH=$(cast keccak $BYTECODE)
  ADDRESS=$(cast keccak "0xff${DEPLOYER#0x}${SALT_BYTES#0x}${BYTECODE_HASH#0x}" | tail -c 41)

  if [[ -n "$ADDRESS" ]]; then
    DEPLOYED_ADDRESSES+=("$CONTRACT_NAME: $ADDRESS")
  fi
done

# Print deployed addresses
echo "Deployed contract addresses:"
for ENTRY in "${DEPLOYED_ADDRESSES[@]}"; do
  echo "$ENTRY"
done

# Keep the script running to allow interaction
wait $ANVIL_PID

