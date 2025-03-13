pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";
import {console} from "forge-std/console.sol";

import {ThresholdWallet} from "../contracts/ThresholdWallet.sol";

contract ThresholdWalletScript is Script {
    function run() public {
        vm.startBroadcast(0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6);
        bytes memory pk = hex"20757356ac9fb41dcb3cfaca4fa615445c2050f5a82004c54fc96e4ad66980db0940b255a45083ff2ce3f022e041c6ba07107e203d915db691c2226ec909e5ca28cc0aa0a20e284f4dd1aef5cecd669b51b5245f5e38b958851b81b4d205ae0029fc403ed19c1cc2bc18d3ca42fbe573168f91c96cc566f5412037b8abc8bee7";

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