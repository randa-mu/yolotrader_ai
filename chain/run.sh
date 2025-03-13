#!/bin/bash

# Exit script on any error
set -e

# Compile the contracts
echo "[+] Compiling contracts..."
forge build
DEPLOYMENT_SCRIPTS=$(find scripts/ -name "*.s.sol")

# Start Anvil with a 15-second block time
anvil --block-time 15 &> anvil.log &
ANVIL_PID=$!
echo "[+] Anvil started with PID $ANVIL_PID"

# Trap Ctrl+C and cleanup
cleanup() {
  echo "[+] Shutting down Anvil..."
  kill $ANVIL_PID
  exit 0
}
trap cleanup SIGINT
trap cleanup EXIT

# Wait for Anvil to be ready
sleep 2

# Deploy compiled contracts
echo "[+] Deploying contracts..."
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Default Anvil key
for FILE in $DEPLOYMENT_SCRIPTS; do
  printf "\t[+] Running script %s...\n" "$(basename "$FILE")"
  forge script "$FILE" --slow --multi --broadcast --private-key $PRIVATE_KEY --rpc-url http://localhost:8545
done

EXPLORER_PORT=5100
echo "[+] Starting block explorer on port $EXPLORER_PORT"
docker stop otterscan > /dev/null
docker run --rm -p $EXPLORER_PORT:80 --name otterscan -d otterscan/otterscan > /dev/null

echo '[+] App running - run `tail -f anvil.log` to see the logs'
wait $ANVIL_PID

