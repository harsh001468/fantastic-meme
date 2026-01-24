# 🔗 MetaMask & Monad Integration Guide

## ✅ Wallet Connection is Now Live!

Your game now has **MetaMask wallet connection** and **Monad blockchain** integration!

---

## 🎮 How to Use

### **Step 1: Connect Wallet**
1. Open the game at http://localhost:3002
2. Click **"🔗 Connect Wallet"** button (top-right corner)
3. MetaMask will popup → Click **"Connect"**
4. If not on Monad network, it will auto-switch/add Monad

### **Step 2: Play & Earn**
1. Play the aim training game
2. After 60 seconds, you'll see your rewards:
   - **Base Reward**: 1 ACT token per 10 points
   - **Accuracy Bonus**: +50 ACT for 80%+ accuracy

### **Step 3: Receive Tokens**
- Currently shows calculated rewards
- To receive actual tokens, deploy smart contracts (see below)

---

## 🌐 Monad Network Configuration

The game automatically configures Monad Testnet:

```javascript
Chain ID: 5027 (0x13A3 hex)
Chain Name: Monad Testnet
Currency: MON
RPC URL: https://rpc.testnet.monad.xyz
Explorer: https://explorer.testnet.monad.xyz
```

---

## 🚀 Deploy Smart Contracts to Receive Real Tokens

### **Prerequisites**
1. **Get Monad Testnet MON tokens** (for gas fees)
   - Visit Monad faucet (if available)
   - Or get test MON from Monad Discord

2. **Set up deployment wallet**
   ```bash
   # Create .env file in contracts/ folder
   cd contracts
   echo "MONAD_RPC_URL=https://rpc.monad.xyz" > .env
   echo "DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE" >> .env
   ```

### **Deploy Contracts**

```bash
# 1. Compile contracts
cd contracts
npx hardhat compile

# 2. Deploy to Monad
npx hardhat run scripts/deploy.ts --network monad

# Output will show contract addresses:
# AimChainToken deployed to: 0xABC...123
# CosmeticsNFT deployed to: 0xDEF...456
# RewardsDistributor deployed to: 0xGHI...789
```

### **Update Game with Contract Addresses**

After deployment, edit `game.js`:

```javascript
// Add after the MONAD_CONFIG section:
const CONTRACT_ADDRESSES = {
  ACT_TOKEN: '0xYOUR_AIMCHAIN_TOKEN_ADDRESS',
  COSMETICS_NFT: '0xYOUR_COSMETICS_NFT_ADDRESS',
  REWARDS_DISTRIBUTOR: '0xYOUR_REWARDS_DISTRIBUTOR_ADDRESS'
};
```

---

## 📜 Smart Contract Overview

### **1. AimChainToken (ACT) - ERC-20**
- Reward token players earn
- Mintable by RewardsDistributor contract
- 18 decimals (standard)

### **2. CosmeticsNFT - ERC-721**
- Unique weapon skins & cosmetics
- Tradable on NFT marketplaces
- Metadata stored on IPFS

### **3. RewardsDistributor**
- Handles token distribution
- Called after each game session
- Mints ACT tokens to player wallet

---

## 🔧 Current Features

### **✅ Working Now**
- MetaMask connection
- Monad network auto-switch/add
- Wallet address display (top-right)
- Connected status indicator
- Reward calculation (base + accuracy bonus)
- Session complete popup with earnings

### **🔜 After Smart Contract Deployment**
- Actual ACT token minting
- On-chain transaction confirmation
- View tokens in MetaMask
- NFT cosmetic rewards
- Leaderboard with wallet integration

---

## 💡 Test Wallet Connection Without Contracts

You can test the wallet connection right now:

1. **Click "Connect Wallet"**
   - MetaMask popup appears
   - Connects to Monad network

2. **Play a session**
   - Complete 60-second training
   - See calculated rewards

3. **Check console** (F12)
   - See wallet address logged
   - See network confirmation
   - See token calculations

---

## 🐛 Troubleshooting

### **"MetaMask not installed"**
- Install from https://metamask.io/download/

### **"Failed to connect wallet"**
- Unlock MetaMask
- Refresh page and try again

### **"Wrong network"**
- Game auto-switches to Monad
- If fails, manually add Monad network in MetaMask

### **"No test tokens"**
- Get MON from Monad faucet
- Join Monad Discord for testnet tokens

---

## 📊 Reward Formula

```javascript
Base Reward = floor(score / 10) ACT tokens
Accuracy Bonus = 50 ACT (if accuracy >= 80%)
Total Reward = Base Reward + Accuracy Bonus

Example:
- Score: 1500
- Accuracy: 85%
- Base: floor(1500/10) = 150 ACT
- Bonus: 50 ACT (85% > 80%)
- Total: 200 ACT tokens
```

---

## 🎯 Next Steps

1. ✅ **Test wallet connection** (works now!)
2. 🔜 Get Monad testnet tokens
3. 🔜 Deploy smart contracts
4. 🔜 Update contract addresses in game.js
5. 🔜 Start earning real ACT tokens!

---

## 📚 Additional Resources

- **Monad Docs**: https://docs.monad.xyz/
- **Hardhat Docs**: https://hardhat.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **MetaMask Setup**: https://metamask.io/

---

**Your wallet integration is live! Connect your MetaMask and start training! 🎮**
