pragma solidity ^0.8.24;

import {BLS} from "./BLS.sol";

contract ThresholdWallet {

    bytes public constant DST = bytes("BLOCKLOCK_BN254G1_XMD:KECCAK-256_SVDW_RO_H1_");
    uint256 public nonce;
    BLS.PointG2 private publicKey;

    event Transfer(address from, address to, uint256 amount);

    constructor(bytes memory pk) {
        publicKey = BLS.g2Unmarshal(pk);
    }

    function transfer(address recipient, uint256 amount, bytes calldata signature) external payable {
        require(address(this).balance >= amount, "balance too low");

        bytes memory m = abi.encode(recipient, amount, nonce);
        BLS.PointG1 memory h_m = BLS.hashToPoint(DST, m);
        BLS.PointG1 memory sig = BLS.g1Unmarshal(signature);
        (bool pairingSuccess, bool callSuccess) = BLS.verifySingle(sig, publicKey, h_m);
        require(pairingSuccess && callSuccess, "signature verification failed");

        nonce = nonce + 1;

        (bool transferSuccess,) = recipient.call{value: amount}("");
        require(transferSuccess, "transfer failed");

        emit Transfer(address(this), recipient, amount);
    }
}