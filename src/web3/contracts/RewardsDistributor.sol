// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AimChainToken.sol";

contract RewardsDistributor {
    AimChainToken public aimChainToken;
    mapping(address => uint256) public rewards;

    event RewardDistributed(address indexed player, uint256 amount);

    constructor(address _aimChainToken) {
        aimChainToken = AimChainToken(_aimChainToken);
    }

    function distributeReward(address player, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        rewards[player] += amount;
        aimChainToken.mint(player, amount);
        emit RewardDistributed(player, amount);
    }

    function claimReward() external {
        uint256 rewardAmount = rewards[msg.sender];
        require(rewardAmount > 0, "No rewards to claim");
        rewards[msg.sender] = 0;
        aimChainToken.mint(msg.sender, rewardAmount);
        emit RewardDistributed(msg.sender, rewardAmount);
    }

    function getRewardBalance(address player) external view returns (uint256) {
        return rewards[player];
    }
}