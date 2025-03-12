import {Script} from "forge-std/Script.sol";

import "../contracts/Counter.sol";

contract CounterScript is Script {
    function run() public {
        vm.startBroadcast();
        new Counter();
        vm.stopBroadcast();

    }
}
