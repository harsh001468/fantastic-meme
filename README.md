# 🎯 AimChain - Three.js FPS Aim Trainer

A **Call of Duty-style first-person shooter** aim training game built with **Three.js** and **Web3** blockchain integration on **Monad**.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 🚀 Features

### **3D Graphics & Gameplay**
- ✅ **True 3D Environment** - WebGL-powered shooting range with realistic depth
- ✅ **Pointer Lock Controls** - Immersive first-person camera (just like COD)
- ✅ **AK-47 Weapon Viewmodel** - Detailed weapon with idle animation, recoil, muzzle flash
- ✅ **Bullseye Targets** - 3D targets with outer/middle/bullseye rings
- ✅ **Raycasting Hit Detection** - Precise shooting mechanics
- ✅ **WASD Movement** - Walk around the shooting range
- ✅ **Ammo System** - 30-round magazine, reload with R key
- ✅ **Score Tracking** - Real-time accuracy, hits, and scoring

### **Web3 Integration**
- 🔗 **Monad Blockchain** - High-speed, low-cost transactions
- 🪙 **AimChain Token (ACT)** - Earn ERC-20 tokens for good performance
- 🎨 **Cosmetics NFTs** - ERC-721 NFTs for weapon skins

---

## 🎮 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3002
# 4. Click "START TRAINING"
# 5. Shoot targets and earn tokens!
```

### **Controls**

| Action | Key/Mouse |
|--------|-----------|
| **Move** | W A S D |
| **Look Around** | Mouse |
| **Shoot** | Left Click |
| **Reload** | R |
| **Pause/Menu** | ESC |
| **Lock/Unlock Mouse** | CTRL |

---

## 🏗️ Technical Architecture

**Frontend**: Three.js 0.160.0 (3D graphics) + PointerLockControls (FPS camera) + Raycaster (hit detection)  
**Backend**: Monad blockchain (EVM-compatible L1) + Smart Contracts (ERC-20 tokens, ERC-721 NFTs)  
**Dev Tools**: Vite (fast HMR), Hardhat (contract deployment)

### **Game Structure** (`game.js` - 650 lines)
- Scene Setup → Camera → Renderer → Lighting
- Shooting Range Environment (ground, walls, poles)
- AK-47 Weapon Viewmodel (attached to camera)
- Bullseye Targets (3D CircleGeometry with 3 rings)
- Raycasting Shooting System (click → raycast → hit detection)
- WASD Movement + Pointer Lock Controls

---

## 📊 Scoring System

| Hit Zone | Points | Radius |
|----------|--------|--------|
| **Bullseye** 🎯 | +10 | 0.2m |
| **Middle Ring** | +8 | 0.4m |
| **Outer Ring** | +5 | 0.6m |

**Token Rewards**: 1 ACT = 10 points | **Accuracy Bonus**: +50 ACT for 80%+ accuracy

---

## 🛠️ Development

### **Build for Production**
```bash
npm run build  # Output: dist/
```

### **Deploy Smart Contracts to Monad**

### **Deploy Smart Contracts to Monad**
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network monad
```

---

## 📚 Documentation

See **[DOCUMENTATION.md](DOCUMENTATION.md)** for complete technical details:
- Three.js architecture deep dive
- Smart contract specifications  
- Web3 integration workflow
- Monad blockchain setup

---

## 🎯 Current Features

✅ Call of Duty training mode  
✅ 3D shooting range environment  
✅ Bullseye targets (3 rings)  
✅ AK-47 weapon with recoil  
✅ Raycasting hit detection  
✅ Score & accuracy tracking  
✅ 60-second timed sessions  
✅ Ammo & reload system  

### **Coming Soon**
🔜 CS:GO & Valorant modes  
🔜 Moving targets  
🔜 Difficulty selection  
🔜 Sound effects  
🔜 Weapon GLTF models  
🔜 NFT weapon skins  

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🔗 Resources

- **Three.js Docs**: https://threejs.org/docs/
- **PointerLockControls**: https://threejs.org/examples/#misc_controls_pointerlock
- **Monad Blockchain**: https://monad.xyz/
- **Hardhat Docs**: https://hardhat.org/

---

**Built with ❤️ using Three.js, Web3, and Monad**