// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GizaToken is ERC20 {
    address private _minter;

    event MinterChanged(address indexed from, address to);
    
    constructor() ERC20("Giza Token", "GIZA") {
        _minter = msg.sender;
    }

    function minter() view public returns (address) {
        return _minter;
    }

    function passMinterRole(address _newMinter) public {
        require(msg.sender == _minter, "Error, only owner can change pass minter role.");
        _minter = _newMinter;
        emit MinterChanged(msg.sender, _newMinter);
    }

    function mint(address account, uint256 amount) public {
        require(msg.sender == _minter, "Error, msg.sender does not have minter role");
		_mint(account, amount);
	}

    function burn(address account, uint256 amount) public {
        require(msg.sender == _minter, "Error, msg.sender does not have minter role");
		_burn(account, amount);
	}
}