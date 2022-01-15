// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './GizaToken.sol';

contract Khufu {
  address private _owner;
  mapping(address => uint256) private _balances;
  mapping(address => bool) private _isParticipating;

  event Join(address indexed user, address indexed referral);
  event Leave(address indexed user, uint amount);
  
  GizaToken private _gizaToken;

  constructor(GizaToken gizaToken_) {
    _owner = msg.sender;
    _balances[_owner] = 0;
    _isParticipating[_owner] = true;
    _gizaToken = gizaToken_;
  }

  function owner() public view returns (address) {
    return _owner;
  }

  function totalBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function isParticipating(address _participant) public view returns (bool) {
    return _isParticipating[_participant];
  }

  function join(address _referral) external payable {
    require(_isParticipating[_referral] == true, 'Error, referral does not exist.');
    require(_isParticipating[msg.sender] == false, 'Error, already participating.');
    require(msg.value == 1e16, 'Error, value to join is 0.01 ETH.');

    uint256 value = msg.value;
    uint256 fee = value / 100;
    _balances[_referral] += fee;
    _balances[msg.sender] = value - fee;
    _isParticipating[msg.sender] = true;

    _gizaToken.mint(msg.sender, 1e18); // 1 GIZA

    emit Join(msg.sender, _referral);
  }

  function balanceOf(address participant) public view returns (uint256) {
    return _balances[participant];
  }

  function leave() public {
    require(msg.sender != _owner, 'Error, owner cannot leave.');
    require(_isParticipating[msg.sender] == true, 'Error, could not find participant.');

    uint256 balance = _balances[msg.sender];
    _balances[msg.sender] = 0;
    _isParticipating[msg.sender] = false;

    payable(msg.sender).transfer(balance);

    emit Leave(msg.sender, balance);
  }

  function withdraw() public {
    require(msg.sender == _owner);
    require(totalBalance() > 0);

    uint256 ownerBalance = balanceOf(_owner);
    payable(msg.sender).transfer(ownerBalance);

    _balances[_owner] = 0;
  }
}
