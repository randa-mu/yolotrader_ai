pragma solidity ^0.8.24;

import "../lib/forge-std/src/Test.sol";
import {ThresholdWallet} from "../contracts/ThresholdWallet.sol";
import {BLS} from "../contracts/BLS.sol";

contract ThresholdWalletTest is Test {
    address public owner;
    address public recipient;
    ThresholdWallet public wallet;

    function setUp() public {
        owner = vm.addr(1);
        recipient = vm.addr(2);
        vm.startPrank(owner);
        bytes memory pk = hex"01015bba27cd2725e80b996e3c6f1dccaa532b63e0bcd48cce529e8c431215c92009b5d7e6659ad11b2134dc5978536f60f0f9c61b4e7cd70f6d069823e9701d0f34ffc0589e6b12d4a7e5c825f3667ea3cf7361c7f2cee5bbc3c18b596726781fbcbb669449e378ed7361d67b949679da223d0c4f29a0da9119b64ffb16abb9";
        wallet = new ThresholdWallet(pk);
        vm.deal(address(wallet), 10 ether);
    }

    function test_TransferFailsInvalidSignature() public {
        bytes memory invalidSignature = hex"02b3b2fa2c402d59e22a2f141e32a092603862a06a695cbfb574c440372a72cd0636ba8092f304e7701ae9abe910cb474edf0408d9dd78ea7f6f97b7f2464711";

        assertTrue(address(wallet).balance == 10 ether, "balance incorrect");
        vm.expectRevert("signature verification failed");
        wallet.transfer(recipient, 1 ether, invalidSignature);
        assertTrue(address(wallet).balance == 10 ether, "balance incorrect");
    }

    function test_TransferSucceedsValidSignature() public {
        bytes memory validSignature = hex"0fa278631510cd1aaa42221eac8f07f744d4c8fae9665f91d0bd33ada1c8414e000a07f7cde2c49926d0aebc2901f230b402fefff795751ed41de0114129cf7e";

        assertTrue(address(wallet).balance == 10 ether, "balance incorrect");
        wallet.transfer(recipient, 1 ether, validSignature);
        console.log(address(wallet).balance);
        assertTrue(address(wallet).balance == 9 ether, "balance incorrect");
    }
}