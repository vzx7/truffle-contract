// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZVToken is ERC20, Ownable {
    uint256 _transactionCount;
    mapping(uint => address) senders;
    
    constructor() ERC20("ZVToken", "ZV20") {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) onlyOwner public {
        _mint(to, amount);
    }

    function sendFunds(address _to, uint _amount) onlyOwner public  payable {
        require(balanceOf(msg.sender) >= _amount, "!!! Transfer amount exceeds balance !!!");
        transfer(_to, _amount);
        _transactionCount += 1;
        senders[_transactionCount] = msg.sender;
    }

    function getTransctionCount() public view returns (uint) {
        return _transactionCount;
    }

    function getSenderByTransactionNum(uint _num) public view returns (address) {
        require(_transactionCount >= _num, "Your number exceeds the number of transactions on this contract, use the get method 'getTransctionCount()' to get the number of transactions....");
        return senders[_num];
    }
}

