pragma solidity ^0.8.24;

contract Counter {
    uint256 private count;

    event CountIncremented(uint256 newCount);
    event CountDecremented(uint256 newCount);

    constructor() {
        count = 0;
    }

    function increment() public {
        count += 1;
        emit CountIncremented(count);
    }

    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit CountDecremented(count);
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}

