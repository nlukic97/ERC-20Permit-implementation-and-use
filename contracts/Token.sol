// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract PermitCoin is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("PermitCoin", "PMC")
        Ownable(initialOwner)
        ERC20Permit("PermitCoin")
    {
        // giving initial deployed 1 ether worth of PermitCoin
        mint(initialOwner, 1 ether);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
