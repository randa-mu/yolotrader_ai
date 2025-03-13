pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";
import {console} from "forge-std/console.sol";

import {ThresholdWallet} from "../contracts/ThresholdWallet.sol";

contract ThresholdWalletScript is Script {
    function run() public {
        vm.startBroadcast(0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6);
        bytes memory pk = hex"01015bba27cd2725e80b996e3c6f1dccaa532b63e0bcd48cce529e8c431215c92009b5d7e6659ad11b2134dc5978536f60f0f9c61b4e7cd70f6d069823e9701d0f34ffc0589e6b12d4a7e5c825f3667ea3cf7361c7f2cee5bbc3c18b596726781fbcbb669449e378ed7361d67b949679da223d0c4f29a0da9119b64ffb16abb9";

        ThresholdWallet treasury = new ThresholdWallet(pk);
        ThresholdWallet orderBook = new ThresholdWallet(pk);

        uint256 amount = 1000 ether;
        (bool success,) = address(treasury).call{ value: amount }("");
        require(success, "failed to transfer");

        vm.stopBroadcast();
        console.log("treasury deployed to: ", address(treasury));
        console.log("orderbook deployed to: ", address(orderBook));
    }
}