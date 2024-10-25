// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract PERMITCOIN is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("PERMITCOIN", "TDC")
        Ownable(initialOwner)
        ERC20Permit("PERMITCOIN")
    {
        mint(initialOwner, 1*10**18); // giving initial deployed 1 Ether
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
