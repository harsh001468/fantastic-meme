# AimChain - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Project Structure](#project-structure)
4. [Game Engine & Components](#game-engine--components)
5. [Blockchain Integration](#blockchain-integration)
6. [Monad Blockchain Integration](#monad-blockchain-integration)
7. [Smart Contracts](#smart-contracts)
8. [Web3 Services](#web3-services)
9. [Game Scenes & Flow](#game-scenes--flow)
10. [Settings System](#settings-system)
11. [Data Persistence](#data-persistence)
12. [Development Workflow](#development-workflow)
13. [Deployment Guide](#deployment-guide)

---

## Project Overview

### What is AimChain?

**AimChain** is a revolutionary **browser-based 3D first-person shooter (FPS)** aim training game built with **Three.js** that combines realistic 3D graphics with Web3 blockchain technology. Built on the **Monad blockchain**, AimChain allows players to:

- **Improve Aim Skills**: Train in a realistic 3D shooting range with Call of Duty-style mechanics
- **Earn Cryptocurrency**: Receive **AimChain Tokens (ACT)** as rewards for performance
- **Collect NFTs**: Unlock and trade unique cosmetic items as ERC-721 NFTs
- **Realistic FPS Experience**: True 3D environment with pointer lock controls, weapon viewmodels, and raycasting
- **Immersive Training**: Bullseye targets, AK-47 weapon system, recoil mechanics, and WASD movement

### Core Value Proposition

1. **Play-to-Earn Mechanism**: Transform practice time into tangible cryptocurrency rewards
2. **Skill-Based Rewards**: Better accuracy and performance = more tokens
3. **Ownership Economy**: NFT cosmetics are truly owned by players, tradable on marketplaces
4. **Competitive Training**: Multiple difficulty levels and game modes cater to all skill levels
5. **Web3 Native**: Seamless MetaMask integration, transparent blockchain transactions

---

## Architecture & Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Phaser 3** | 3.60.0 | 2D game engine for rendering and game loop |
| **TypeScript** | 5.0.0 | Type-safe JavaScript for robust development |
| **Vite** | 4.3.0 | Fast build tool and dev server with HMR |
| **Ethers.js** | 5.7.2 | Ethereum library for blockchain interactions |
| **Web3.js** | 1.10.0 | Alternative Web3 provider for MetaMask |

### Blockchain Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.0 | Smart contract programming language |
| **Hardhat** | 2.14.0 | Ethereum development environment |
| **OpenZeppelin** | Latest | Secure, audited smart contract libraries |
| **Monad Blockchain** | - | EVM-compatible blockchain for deployment |

### Development Tools

- **Jest**: Unit testing framework
- **ESLint**: Code linting and style enforcement
- **Hardhat Toolbox**: Smart contract testing and deployment
- **Vite Plugin HTML**: HTML template processing

---

## Project Structure

```
aimchain/
│
├── contracts/                      # Hardhat smart contract project
│   ├── hardhat.config.ts          # Hardhat configuration for Monad
│   └── scripts/                   # Deployment and interaction scripts
│
├── public/                        # Static assets
│   ├── index.html                # Main HTML entry point (Three.js + UI)
│   └── assets/
│       └── sounds/               # Audio files (gunshots, hits, music)
│
├── game.js                        # Main Three.js game file
│   ├── Scene setup              # Three.js scene, camera, renderer
│   ├── PointerLockControls      # First-person camera controller
│   ├── Environment              # Shooting range (ground, walls, poles)
│   ├── Weapon system            # AK-47 viewmodel with animations
│   ├── Target system            # 3D bullseye targets with raycasting
│   ├── Shooting mechanics       # Raycasting, ammo, reload, scoring
│   ├── Movement system          # WASD movement
│   └── Game loop                # Animation loop and timer
│
├── src/                          # Source code
│   │
│   ├── web3/                    # Blockchain integration layer
│   │   ├── contracts/          # Solidity smart contracts
│   │   │   ├── AimChainToken.sol             # ERC-20 token for rewards
│   │   │   ├── CosmeticsNFT.sol              # ERC-721 NFT for cosmetics
│   │   │   └── RewardsDistributor.sol        # Token distribution logic
│   │   │
│   │   ├── services/           # Web3 interaction services
│   │   │   ├── WalletService.ts              # MetaMask connection and wallet ops
│   │   │   ├── ContractService.ts            # Smart contract method calls
│   │   │   └── NFTService.ts                 # NFT minting and transfers
│   │   │
│   │   └── types/              # TypeScript type definitions
│   │       └── index.ts                      # Web3 interfaces and types
│
├── package.json                # NPM dependencies and scripts
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite bundler configuration
├── README.md                  # Basic project readme
└── DOCUMENTATION.md           # This comprehensive guide

```

### Architecture Overview

**Three.js Core**: Single-file architecture (`game.js`) containing all game logic  
**WebGL Rendering**: Hardware-accelerated 3D graphics via Three.js  
**Pointer Lock API**: Immersive FPS controls with locked cursor  
**Raycasting**: Precise hit detection from camera to 3D targets  
**Web3 Integration**: Smart contracts handle rewards and NFTs  

**Total Lines of Code**: ~650 lines in game.js (fully functional FPS trainer)
│   │   │   ├── ValorantTrainingScene.ts       # Valorant training mode
│   │   │   ├── LeaderboardScene.ts            # Global/Daily/Weekly/Personal stats (710 lines)
│   │   │   ├── SettingsScene.ts               # Comprehensive settings menu (1100 lines)
│   │   │   └── DashboardScene.ts              # Player profile and wallet
│   │   │
│   │   ├── managers/            # Game management systems
│   │   │   ├── AudioManager.ts               # Sound effects and music control
│   │   │   ├── GameManager.ts                # Scene transitions and state
│   │   │   └── ScoreManager.ts               # Score calculation and tracking
│   │   │
│   │   └── entities/            # Game objects
│   │       ├── Player.ts                     # Player character representation
│   │       ├── Target.ts                     # Training target objects
│   │       └── Crosshair.ts                  # Aiming reticle
│   │
│   ├── web3/                    # Blockchain integration layer
│   │   ├── contracts/          # Solidity smart contracts
│   │   │   ├── AimChainToken.sol             # ERC-20 token for rewards
│   │   │   ├── CosmeticsNFT.sol              # ERC-721 NFT for cosmetics
│   │   │   └── RewardsDistributor.sol        # Token distribution logic
│   │   │
│   │   ├── services/           # Web3 interaction services
│   │   │   ├── WalletService.ts              # MetaMask connection and wallet ops
│   │   │   ├── ContractService.ts            # Smart contract method calls
│   │   │   └── NFTService.ts                 # NFT minting and transfers
│   │   │
│   │   └── types/              # TypeScript type definitions
│   │       └── index.ts                      # Web3 interfaces and types
│   │
│   ├── ui/                     # User interface components
│   │   ├── components/
│   │   │   ├── WalletConnect.ts              # Wallet connection UI
│   │   │   ├── Inventory.ts                  # NFT inventory display
│   │   │   └── StatsDisplay.ts               # Player statistics UI
│   │   │
│   │   └── styles/
│   │       └── main.css                      # Global CSS styles
│   │
│   └── utils/                  # Utility functions
│       ├── SettingsApplier.ts               # Real-time settings application (619 lines)
│       ├── helpers.ts                       # General helper functions
│       └── math.ts                          # Math utilities
│
├── package.json                # NPM dependencies and scripts
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite bundler configuration
├── README.md                  # Basic project readme
├── SETTINGS_SYSTEM.md         # Settings implementation docs
└── DOCUMENTATION.md           # This comprehensive guide

```

### File Count & Lines of Code

**Total TypeScript Files:** 33  
**Major Components:**
- CODTrainingScene.ts: 1,589 lines (main game loop)
- SettingsScene.ts: 1,100 lines (settings UI)
- LeaderboardScene.ts: 710 lines (stats and rankings)
- SettingsApplier.ts: 619 lines (settings engine)

**Total Estimated Lines:** ~8,000+ lines of TypeScript code

---

## Game Engine & Components

### Three.js Architecture

AimChain uses **Three.js**, a powerful 3D graphics library for creating WebGL experiences in the browser. Three.js provides:

#### Core Components

**1. Scene**
- Container for all 3D objects, lights, and cameras
- Represents the 3D world
```typescript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 0, 750); // Distance fog
```

**2. Camera (PerspectiveCamera)**
- Simulates human eye perspective
- FOV 75°, positioned at eye level (1.6m height)
```typescript
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping
  1000 // Far clipping
);
camera.position.set(0, 1.6, 0); // Eye level
```

**3. Renderer (WebGLRenderer)**
- Renders 3D scene to HTML canvas
- Hardware-accelerated via WebGL
```typescript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
```

#### PointerLockControls

**First-Person Camera Control** using Three.js addon:

```typescript
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const controls = new PointerLockControls(camera, document.body);

// Lock pointer on click
controls.lock();

// Events
controls.addEventListener('lock', () => {
  // Mouse is locked, show crosshair
});

controls.addEventListener('unlock', () => {
  // Mouse is unlocked, show menu
});

// Movement
controls.moveForward(distance);
controls.moveRight(distance);
```

**Benefits**:
- Native browser pointer lock (immersive FPS controls)
- Cursor hidden and centered
- Unlimited mouse movement (no screen edges)
- CTRL key toggle support

#### Key Systems in AimChain

**1. 3D Environment System**
```typescript
// Ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7a6c4f, // Dirt brown
  roughness: 0.9 
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to horizontal
ground.receiveShadow = true;
scene.add(ground);

// Walls with BoxGeometry
const wallGeometry = new THREE.BoxGeometry(100, 15, 1);
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(0, 7.5, -50);
wall.castShadow = true;
scene.add(wall);
```

**2. Weapon Viewmodel System**
```typescript
// Create weapon group attached to camera
const weaponGroup = new THREE.Group();
camera.add(weaponGroup); // Moves with camera automatically

// AK-47 components
const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.12, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.7 })
);

const barrel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9 })
);
barrel.rotation.z = Math.PI / 2;

weapon = new THREE.Group();
weapon.add(body, barrel, magazine, stock);

// Position in bottom-right of view
weapon.position.set(0.25, -0.2, -0.5);
weapon.rotation.y = -0.1;

weaponGroup.add(weapon);

// Idle animation (breathing sway)
let time = 0;
weapon.position.y = -0.2 + Math.sin(time) * 0.004;
weapon.rotation.z = Math.sin(time * 0.5) * 0.008;
```

**3. Raycasting Hit Detection**
```typescript
// Create raycaster from camera
const raycaster = new THREE.Raycaster();
const shootDirection = new THREE.Vector3();

// On shoot
camera.getWorldDirection(shootDirection);
raycaster.set(camera.position, shootDirection);

// Check intersections with target meshes
const intersects = raycaster.intersectObjects(targetMeshes);

if (intersects.length > 0) {
  const hitPoint = intersects[0].point;
  const distance = hitPoint.distanceTo(target.position);
  
  if (distance <= target.bullseyeRadius) {
    // BULLSEYE HIT! +10 points
  }
}
```

**4. Target System (3D Bullseye)**
```typescript
const createBullseyeTarget = (x, y, z) => {
  const targetGroup = new THREE.Group();
  
  // Wooden board (background)
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x8b7355 })
  );
  board.castShadow = true;
  targetGroup.add(board);
  
  // Outer ring (red) - CircleGeometry
  const outerRing = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 32),
    new THREE.MeshBasicMaterial({ color: 0xff4444 })
  );
  outerRing.position.z = 0.06;
  targetGroup.add(outerRing);
  
  // Middle ring (white)
  const middleRing = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  middleRing.position.z = 0.07;
  targetGroup.add(middleRing);
  
  // Bullseye (yellow)
  const bullseye = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xffdd00 })
  );
  bullseye.position.z = 0.08;
  targetGroup.add(bullseye);
  
  // Position and orient toward camera
  targetGroup.position.set(x, y, z);
  targetGroup.lookAt(camera.position);
  
  scene.add(targetGroup);
  
  return {
    group: targetGroup,
    position: new THREE.Vector3(x, y, z),
    outerRadius: 0.6,
    middleRadius: 0.4,
    bullseyeRadius: 0.2,
    board: board // For raycasting
  };
};

// Spawn at random position
const x = (Math.random() - 0.5) * 40; // -20 to 20m
const y = 1.2 + Math.random() * 2.5; // 1.2 to 3.7m high
const z = -10 - Math.random() * 30; // 10 to 40m away
```

**5. Weapon Recoil System**
  const target = {
    container: this.add.container(x, y),
    outerRing: this.add.circle(0, 0, 50, 0xff4444),
    middleRing: this.add.circle(0, 0, 30, 0xffffff),
    innerRing: this.add.circle(0, 0, 10, 0xffdd00),
    health: 100,
    isActive: true
  };
  
  target.container.add([target.outerRing, target.middleRing, target.innerRing]);
  this.targets.push(target);
}
```

**5. Weapon Recoil System**
```typescript
const shoot = () => {
  if (ammo <= 0 || isReloading) return;
  
  ammo--;
  shotsFired++;
  
  // Weapon visual recoil
  weapon.position.y -= 0.05; // Kick down
  weapon.rotation.x -= 0.1; // Rotate back
  weapon.rotation.y += (Math.random() - 0.5) * 0.02; // Horizontal spread
  
  // Reset after 100ms
  setTimeout(() => {
    weapon.position.y = -0.2;
    weapon.rotation.x = 0.05;
    weapon.rotation.y = -0.1;
  }, 100);
  
  // Muzzle flash (PointLight)
  const flash = new THREE.PointLight(0xffaa00, 3, 5);
  flash.position.set(0.25, -0.15, -0.9);
  weaponGroup.add(flash);
  setTimeout(() => weaponGroup.remove(flash), 50);
};
```

**6. WASD Movement System**
```typescript
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

// Keyboard input
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyW') moveState.forward = true;
  if (event.code === 'KeyS') moveState.backward = true;
  if (event.code === 'KeyA') moveState.left = true;
  if (event.code === 'KeyD') moveState.right = true;
});

// In animation loop
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

direction.z = Number(moveState.forward) - Number(moveState.backward);
direction.x = Number(moveState.right) - Number(moveState.left);
direction.normalize();

if (moveState.forward || moveState.backward) {
  velocity.z = direction.z * moveSpeed;
}
if (moveState.left || moveState.right) {
  velocity.x = direction.x * moveSpeed;
}

controls.moveRight(velocity.x);
controls.moveForward(velocity.z);
camera.position.y = 1.6; // Maintain eye level
```

**7. Animation Loop (60 FPS)**
```typescript
const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update weapon idle animation
  weaponAnimation();
  
  // Update movement
  if (controls.isLocked) {
    // Process WASD input
    updateMovement();
  }
  
  // Update targets to face camera
  targets.forEach(target => {
    target.group.lookAt(camera.position);
  });
  
  // Render frame
  renderer.render(scene, camera);
};

animate(); // Start loop
```

### Game Features

#### Call of Duty Style Training Mode
- **3D Shooting Range**: 100m x 100m environment with walls and depth markers
- **Bullseye Targets**: 3 concentric rings (outer red, middle white, bullseye yellow)
- **AK-47 weapon** with realistic recoil
- **Military range environment** with dirt ground and mountains
- **4 Difficulties**: Easy, Medium, Hard, Extreme
- **Session durations**: 30s, 60s, 3min, 5min
- **Scoring**: Bullseye +10, Middle +8, Outer +5

#### 2. CS:GO Mode
- **Coming Soon** (placeholder scene exists)
- Planned: Static targets, spray patterns, economy system

#### 3. Valorant Mode
- **Coming Soon** (placeholder scene exists)
- Planned: Agent abilities simulation, character hitboxes

### Difficulty Configurations

```typescript
const difficultyConfigs = {
  easy: {
    targetSize: 100,
    spawnDistance: { min: 150, max: 300 },
    targetCount: 2,
    movementSpeed: 0,
    movementEnabled: false,
    spawnDelay: 1000 // ms between spawns
  },
  medium: {
    targetSize: 80,
    spawnDistance: { min: 200, max: 400 },
    targetCount: 3,
    movementSpeed: 40,
    movementEnabled: true,
    spawnDelay: 600
  },
  hard: {
    targetSize: 60,
    spawnDistance: { min: 250, max: 500 },
    targetCount: 4,
    movementSpeed: 80,
    movementEnabled: true,
    spawnDelay: 400
  },
  extreme: {
    targetSize: 50,
    spawnDistance: { min: 300, max: 550 },
    targetCount: 5,
    movementSpeed: 120,
    movementEnabled: true,
    spawnDelay: 300
  }
};
```

---

## Blockchain Integration

### Overview

AimChain integrates blockchain technology to enable:

1. **Token Rewards**: Players earn ACT tokens for in-game performance
2. **NFT Cosmetics**: Unique weapon skins, crosshairs, and effects
3. **Decentralized Ownership**: Players truly own their digital assets
4. **Transparent Economics**: All transactions verifiable on-chain

### Web3 Architecture

```
Player (Browser)
    ↓
MetaMask Wallet (User Authentication)
    ↓
Ethers.js Library (Transaction Signing)
    ↓
Monad RPC Node (Transaction Broadcast)
    ↓
Smart Contracts (AimChainToken, CosmeticsNFT, RewardsDistributor)
    ↓
Monad Blockchain (Immutable Ledger)
```

### Wallet Connection Flow

```typescript
// 1. User clicks "Connect Wallet" button
async connectWallet() {
  // 2. Check if MetaMask is installed
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }
  
  // 3. Request account access
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  
  // 4. Get signer (authenticated user)
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  
  // 5. Check network (ensure user is on Monad)
  const network = await provider.getNetwork();
  if (network.chainId !== MONAD_CHAIN_ID) {
    alert('Please switch to Monad network');
    return;
  }
  
  // 6. Store wallet info in game state
  this.walletAddress = address;
  this.walletConnected = true;
  
  // 7. Load player's token balance and NFTs
  await this.loadPlayerAssets();
}
```

### Transaction Flow

```typescript
// After game session ends
async distributeRewards() {
  const score = this.getScore();
  const accuracy = this.getAccuracy();
  
  // Calculate token reward
  const baseTokens = Math.floor(score / 10); // 10 points = 1 token
  const accuracyBonus = accuracy > 0.8 ? 50 : 0;
  const totalTokens = baseTokens + accuracyBonus;
  
  // Call smart contract
  const contract = new ethers.Contract(
    REWARDS_DISTRIBUTOR_ADDRESS,
    RewardsDistributorABI,
    signer
  );
  
  // Submit transaction
  const tx = await contract.distributeReward(
    this.walletAddress,
    totalTokens
  );
  
  // Wait for confirmation
  await tx.wait();
  
  // Show success message
  this.showNotification(`You earned ${totalTokens} ACT tokens!`);
}
```

---

## Monad Blockchain Integration

### What is Monad?

**Monad** is a high-performance, EVM-compatible Layer 1 blockchain designed for:

- **10,000+ TPS**: Parallel transaction execution
- **1-second block times**: Near-instant finality
- **Low fees**: Cost-effective for gaming transactions
- **Full EVM compatibility**: Deploy Solidity contracts as-is

### Why Monad for AimChain?

| Feature | Benefit for AimChain |
|---------|----------------------|
| **High TPS** | Handle thousands of concurrent players earning rewards |
| **Fast Finality** | Players see rewards in seconds, not minutes |
| **Low Gas Fees** | Microtransactions economically viable (1-10 token rewards) |
| **EVM Compatible** | Use standard Ethereum tools (Hardhat, Ethers.js, OpenZeppelin) |
| **Parallel Execution** | Multiple players can claim rewards simultaneously |

### Monad Network Configuration

```typescript
// hardhat.config.ts
networks: {
  monad: {
    url: "https://rpc.monad.xyz", // Monad RPC endpoint
    chainId: 10000, // Monad chain ID
    accounts: [process.env.PRIVATE_KEY],
    gas: 2100000,
    gasPrice: 8000000000
  }
}
```

```typescript
// Frontend network detection
const MONAD_NETWORK = {
  chainId: '0x2710', // 10000 in hex
  chainName: 'Monad',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://rpc.monad.xyz'],
  blockExplorerUrls: ['https://explorer.monad.xyz']
};

// Auto-switch to Monad network
async switchToMonad() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_NETWORK.chainId }]
    });
  } catch (switchError) {
    // Network not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_NETWORK]
      });
    }
  }
}
```

### Monad Features Used

**1. Parallel Transaction Processing**
- Multiple players can simultaneously claim rewards
- No transaction queue bottlenecks
- Optimal for high-concurrency gaming

**2. Low-Latency Block Confirmation**
- 1-second blocks mean rewards appear almost instantly
- Better UX than traditional 12-15 second Ethereum blocks

**3. Efficient State Storage**
- Player statistics stored on-chain efficiently
- Minimal gas costs for frequent updates

---

## Smart Contracts

### 1. AimChainToken (ACT) - ERC-20

**Purpose**: Fungible token for in-game rewards

**File**: `src/web3/contracts/AimChainToken.sol`

```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AimChainToken is ERC20, Ownable {
    // Token details: Name "AimChainToken", Symbol "ACT"
    constructor(uint256 initialSupply) ERC20("AimChainToken", "ACT") {
        _mint(msg.sender, initialSupply); // Mint initial supply to deployer
    }

    // Only contract owner can mint new tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Players can burn their own tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

**Key Features**:
- **Mintable**: Contract owner can mint rewards for players
- **Burnable**: Players can burn tokens (for future NFT purchases)
- **Standard ERC-20**: Compatible with all Ethereum wallets and DEXs
- **18 Decimals**: Standard Ethereum decimal precision

**Usage in Game**:
```typescript
// Mint 100 ACT tokens to player
const tx = await aimChainToken.mint(playerAddress, ethers.utils.parseEther("100"));
await tx.wait();
```

---

### 2. CosmeticsNFT - ERC-721

**Purpose**: Unique NFT cosmetic items (weapon skins, crosshairs, effects)

**File**: `src/web3/contracts/CosmeticsNFT.sol`

```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CosmeticsNFT is ERC721, Ownable {
    uint256 public nextTokenId; // Auto-incrementing token ID
    string private baseTokenURI; // IPFS base URL for metadata

    event Minted(address indexed owner, uint256 indexed tokenId);

    constructor(string memory name, string memory symbol, string memory _baseTokenURI) 
        ERC721(name, symbol) {
        baseTokenURI = _baseTokenURI;
    }

    // Mint NFT to player
    function mint(address to) external onlyOwner {
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        _safeMint(to, tokenId); // Safe mint with receiver check
        emit Minted(to, tokenId);
    }

    // Get NFT metadata URI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI; // e.g., "ipfs://Qm.../metadata/"
    }

    // Update metadata base URI (for migrations)
    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
}
```

**Key Features**:
- **Unique Tokens**: Each NFT has a unique ID
- **Metadata**: Links to IPFS for images and attributes
- **Transferable**: Players can trade NFTs on OpenSea, Rarible, etc.
- **Ownable**: Only contract owner can mint (controlled distribution)

**NFT Metadata Structure** (IPFS JSON):
```json
{
  "name": "Golden AK-47",
  "description": "Legendary weapon skin for COD mode",
  "image": "ipfs://Qm.../golden_ak47.png",
  "attributes": [
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Game Mode", "value": "COD" },
    { "trait_type": "Weapon", "value": "AK-47" },
    { "trait_type": "Effect", "value": "Golden Glow" }
  ]
}
```

**Usage in Game**:
```typescript
// Mint legendary skin to player who achieved 1000 bullseyes
const tx = await cosmeticsNFT.mint(playerAddress);
await tx.wait();

// Get player's NFT collection
const balance = await cosmeticsNFT.balanceOf(playerAddress);
const tokenIds = [];
for (let i = 0; i < balance; i++) {
  const tokenId = await cosmeticsNFT.tokenOfOwnerByIndex(playerAddress, i);
  tokenIds.push(tokenId);
}
```

---

### 3. RewardsDistributor

**Purpose**: Distribute ACT tokens to players based on performance

**File**: `src/web3/contracts/RewardsDistributor.sol`

```solidity
pragma solidity ^0.8.0;

import "./AimChainToken.sol";

contract RewardsDistributor {
    AimChainToken public aimChainToken; // Reference to token contract
    mapping(address => uint256) public rewards; // Pending rewards per player

    event RewardDistributed(address indexed player, uint256 amount);

    constructor(address _aimChainToken) {
        aimChainToken = AimChainToken(_aimChainToken);
    }

    // Distribute rewards to a player (called by game backend/oracle)
    function distributeReward(address player, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        rewards[player] += amount; // Accumulate pending rewards
        aimChainToken.mint(player, amount); // Mint tokens directly
        emit RewardDistributed(player, amount);
    }

    // Player manually claims accumulated rewards
    function claimReward() external {
        uint256 rewardAmount = rewards[msg.sender];
        require(rewardAmount > 0, "No rewards to claim");
        rewards[msg.sender] = 0; // Reset balance
        aimChainToken.mint(msg.sender, rewardAmount);
        emit RewardDistributed(msg.sender, rewardAmount);
    }

    // View pending rewards
    function getRewardBalance(address player) external view returns (uint256) {
        return rewards[player];
    }
}
```

**Key Features**:
- **Reward Accumulation**: Rewards can batch before claiming
- **Gas Optimization**: Players pay gas only when claiming
- **Transparent**: All distributions emit events for tracking
- **Flexible**: Supports both auto-distribution and manual claiming

**Distribution Strategy**:

| Scenario | Method | Gas Paid By |
|----------|--------|-------------|
| Auto-Distribution | `distributeReward()` called by backend | Game (subsidized) |
| Manual Claim | Player calls `claimReward()` | Player |

**Reward Calculation Example**:
```typescript
// Calculate reward based on game performance
function calculateReward(sessionData) {
  const { score, accuracy, bullseyes, combo } = sessionData;
  
  // Base reward: 1 token per 10 points
  const baseReward = Math.floor(score / 10);
  
  // Accuracy bonus: 50 tokens for 80%+ accuracy
  const accuracyBonus = accuracy >= 0.8 ? 50 : 0;
  
  // Bullseye bonus: 2 tokens per bullseye
  const bullseyeBonus = bullseyes * 2;
  
  // Combo bonus: 5 tokens per 10x combo milestone
  const comboBonus = Math.floor(combo / 10) * 5;
  
  return baseReward + accuracyBonus + bullseyeBonus + comboBonus;
}

// Example: Score 1500, 85% accuracy, 20 bullseyes, 45 max combo
// Base: 150, Accuracy: 50, Bullseye: 40, Combo: 20
// Total: 260 ACT tokens
```

---

## Web3 Services

### WalletService

**Purpose**: Manage MetaMask wallet connections and operations

**File**: `src/web3/services/WalletService.ts`

```typescript
class WalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private address: string | null = null;

  // Connect to MetaMask
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    // Initialize provider
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get authenticated signer
    this.signer = this.provider.getSigner();
    this.address = await this.signer.getAddress();
    
    return this.address; // e.g., "0x1234...5678"
  }

  // Get ETH/MON balance
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance); // Convert wei to ETH
  }

  // Sign message (for authentication)
  async signMessage(message: string): Promise<string> {
    return await this.signer.signMessage(message);
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }
}
```

---

### ContractService

**Purpose**: Interact with deployed smart contracts

**File**: `src/web3/services/ContractService.ts`

```typescript
class ContractService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  // Connect wallet
  async connectWallet() {
    await this.provider.send("eth_requestAccounts", []);
    this.signer = this.provider.getSigner();
  }

  // Get ACT token balance
  async getTokenBalance(address: string): Promise<string> {
    const contract = new ethers.Contract(
      ACT_TOKEN_ADDRESS,
      AimChainTokenABI,
      this.provider
    );
    
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }

  // Distribute rewards (admin function)
  async distributeRewards(address: string, amount: number): Promise<any> {
    const contract = new ethers.Contract(
      REWARDS_DISTRIBUTOR_ADDRESS,
      RewardsDistributorABI,
      this.signer // Need signer for transactions
    );
    
    const tx = await contract.distributeReward(
      address,
      ethers.utils.parseEther(amount.toString())
    );
    
    return await tx.wait(); // Wait for confirmation
  }

  // Generic contract call
  async callContractMethod(
    contract: ethers.Contract,
    methodName: string,
    ...args: any[]
  ) {
    return await contract[methodName](...args);
  }
}
```

---

### NFTService

**Purpose**: Mint and manage NFT cosmetics

**File**: `src/web3/services/NFTService.ts`

```typescript
class NFTService {
  private contract: ethers.Contract | null = null;

  // Initialize contract
  init(address: string, abi: any, signer: ethers.Signer) {
    this.contract = new ethers.Contract(address, abi, signer);
  }

  // Mint new cosmetic NFT
  async mintCosmetic(to: string, tokenURI: string): Promise<any> {
    const tx = await this.contract.mint(to);
    return await tx.wait();
  }

  // Transfer NFT to another player
  async transferCosmetic(
    from: string,
    to: string,
    tokenId: number
  ): Promise<any> {
    const tx = await this.contract.transferFrom(from, to, tokenId);
    return await tx.wait();
  }

  // Get NFT owner
  async getCosmeticOwner(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }

  // Get NFT metadata URI
  async getCosmeticURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }

  // Get all NFTs owned by address
  async getUserNFTs(address: string): Promise<any[]> {
    const balance = await this.contract.balanceOf(address);
    const tokens = [];
    
    for (let i = 0; i < balance; i++) {
      const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
      const uri = await this.getCosmeticURI(tokenId);
      tokens.push({ tokenId, uri });
    }
    
    return tokens;
  }
}
```

---

## Game Scenes & Flow

### Scene Flow Diagram

```
┌─────────────────┐
│   MainMenu      │ ← Start Here
│  - Start Game   │
│  - Settings     │
│  - Leaderboard  │
│  - Dashboard    │
└────────┬────────┘
         │ Click "START TRAINING"
         ↓
┌─────────────────────────┐
│ GameModeSelectionScene  │
│  - CS:GO                │
│  - Valorant             │
│  - Call of Duty   ✓     │
└────────┬────────────────┘
         │ Select "COD"
         ↓
┌─────────────────────────┐
│  CODDifficultyScene     │
│  - Easy                 │
│  - Medium               │
│  - Hard                 │
│  - Extreme              │
└────────┬────────────────┘
         │ Select "Medium"
         ↓
┌─────────────────────────┐
│  CODTrainingScene       │ ← Main Game
│  - Bullseye targets     │
│  - AK-47 weapon         │
│  - Recoil system        │
│  - Score tracking       │
│  - Timer countdown      │
└────────┬────────────────┘
         │ Session Ends (time up or ESC)
         ↓
┌─────────────────────────┐
│  Results Screen         │
│  - Final Score          │
│  - Accuracy %           │
│  - Bullseyes            │
│  - Tokens Earned        │
│  - Blockchain TX        │
└────────┬────────────────┘
         │ "Continue"
         ↓
┌─────────────────────────┐
│  MainMenu (return)      │
│  OR                     │
│  LeaderboardScene       │
└─────────────────────────┘
```

### Scene Descriptions

#### 1. MainMenu
- **File**: `src/game/scenes/MainMenu.ts`
- **Purpose**: Entry point, navigation hub
- **Buttons**:
  - **START TRAINING**: Launch game mode selection
  - **DASHBOARD**: View profile, wallet, stats
  - **LEADERBOARD**: View global/daily/weekly rankings
  - **SETTINGS**: Adjust gameplay, graphics, audio, controls
- **Features**: Animated title, background effects

#### 2. GameModeSelectionScene
- **File**: `src/game/scenes/GameModeSelectionScene.ts`
- **Purpose**: Choose training mode (CS:GO, Valorant, COD)
- **Status**:
  - CS:GO: Coming Soon
  - Valorant: Coming Soon
  - **COD: Fully Implemented** ✓

#### 3. CODDifficultyScene
- **File**: `src/game/scenes/CODDifficultyScene.ts`
- **Purpose**: Select difficulty level
- **Options**:
  - **Easy**: Large targets, slow movement, 2 targets
  - **Medium**: Normal targets, moderate movement, 3 targets
  - **Hard**: Small targets, fast movement, 4 targets
  - **Extreme**: Tiny targets, very fast, 5 targets
- **Preview**: Shows target size, count, speed before starting

#### 4. CODTrainingScene (Main Game)
- **File**: `src/game/scenes/CODTrainingScene.ts` (1,589 lines)
- **Purpose**: Core gameplay loop
- **Features**:
  - Real-time FPS aiming with pointer lock
  - Dynamic bullseye targets (3 rings)
  - AK-47 weapon with recoil, muzzle flash, shell ejection
  - Scoring: Bullseye +10, Middle +8, Outer +5
  - Combo system (multiplier for consecutive hits)
  - Ammo management (30/90 rounds, reload)
  - Timer countdown
  - Live HUD: Score, Accuracy, Time, Ammo, Combo
  - Pause menu (Continue, Settings, Leaderboard, Exit)
  - Hit markers (X on successful hits)
  - Damage numbers (floating score text)
  - Session end results with blockchain transaction

#### 5. LeaderboardScene
- **File**: `src/game/scenes/LeaderboardScene.ts` (710 lines)
- **Purpose**: Display rankings and statistics
- **Tabs**:
  - **Global**: All-time top players
  - **Daily**: Top players in last 24 hours
  - **Weekly**: Top players in last 7 days
  - **Personal Stats**: Career stats (high score, avg accuracy, total bullseyes, sessions played, tokens earned)
- **Features**:
  - Scrollable table with mouse wheel
  - Top 3 medals (🥇🥈🥉)
  - Color-coded accuracy (green >70%, yellow >50%, red <50%)
  - Live indicator (pulsing red dot for online players)
  - Player card modal with detailed stats
  - Alternating row backgrounds

#### 6. SettingsScene
- **File**: `src/game/scenes/SettingsScene.ts` (1,100 lines)
- **Purpose**: Customize game settings
- **Tabs**:
  - **Gameplay**: Sensitivity, FOV, crosshair, session duration
  - **Graphics**: Quality preset, FPS limit, shadows, particles, FPS counter
  - **Audio**: Master volume, gunshot, hit sound, UI, background music
  - **Controls**: Invert Y, raw input, keybindings
- **Features**:
  - Real-time application (no restart needed)
  - localStorage persistence
  - Unsaved changes warning
  - Reset to defaults button

#### 7. DashboardScene
- **File**: `src/game/scenes/DashboardScene.ts`
- **Purpose**: Player profile and wallet management
- **Features**:
  - Wallet address display
  - ACT token balance
  - NFT inventory (cosmetics owned)
  - Career statistics
  - Transaction history
  - Connect/disconnect wallet

---

## Settings System

### Architecture

**File**: `src/utils/SettingsApplier.ts` (619 lines)

The settings system uses a **singleton pattern** to centralize all settings management:

```typescript
class SettingsApplier {
  private static instance: SettingsApplier;
  private currentScene: Scene | null = null;
  private settings: GameSettings;

  // Singleton access
  public static getInstance(): SettingsApplier {
    if (!SettingsApplier.instance) {
      SettingsApplier.instance = new SettingsApplier();
    }
    return SettingsApplier.instance;
  }

  // Register active scene for applying settings
  public setScene(scene: Scene) {
    this.currentScene = scene;
  }

  // Apply setting in real-time
  public applySetting(keyPath: string, value: any) {
    // e.g., keyPath = "gameplay.mouseSensitivity"
    const keys = keyPath.split('.');
    this.settings[keys[0]][keys[1]] = value;
    
    // Update localStorage
    localStorage.setItem('aimchain_settings_v1', JSON.stringify(this.settings));
    
    // Apply to active scene immediately
    this.applyToScene(keys[0], keys[1], value);
  }
}

export const settingsApplier = SettingsApplier.getInstance();
```

### Real-Time Application

**User changes slider in SettingsScene:**
```typescript
createSlider(..., (newValue) => {
  // Update local state
  this.settings.gameplay.mouseSensitivity = newValue;
  
  // Apply to game immediately (no restart!)
  settingsApplier.applySetting('gameplay.mouseSensitivity', newValue);
});
```

**SettingsApplier updates CODTrainingScene:**
```typescript
applyMouseSensitivity(sensitivity: number) {
  if (this.currentScene && 'mouseSensitivity' in this.currentScene) {
    this.currentScene.mouseSensitivity = sensitivity; // Direct property update
  }
}
```

**Game uses new sensitivity instantly:**
```typescript
// In CODTrainingScene.update()
this.input.on('pointermove', (pointer) => {
  // Uses updated sensitivity value
  this.cameraRotation.x += pointer.movementX * this.mouseSensitivity * 100;
});
```

### Settings Categories

Detailed documentation in [SETTINGS_SYSTEM.md](SETTINGS_SYSTEM.md)

---

## Data Persistence

### localStorage Structure

AimChain uses browser localStorage for client-side data:

**1. Settings**
- **Key**: `aimchain_settings_v1`
- **Structure**: JSON object with gameplay/graphics/audio/controls
- **Persistence**: Survives page refreshes, browser restarts

**2. Leaderboard Data**
- **Key**: `aimchain_cod_history`
- **Structure**: Array of session results with timestamps
- **Filters**: Daily (last 24h), Weekly (last 7 days), Global (all-time)

**Example**:
```json
{
  "player": "0x1234...5678",
  "score": 1500,
  "accuracy": 85,
  "bullseyes": 20,
  "shotsFired": 150,
  "shotsHit": 128,
  "tokensEarned": 260,
  "timestamp": 1737734400000,
  "difficulty": "medium",
  "sessionDuration": 60
}
```

**3. Player Profile**
- **Key**: `aimchain_player_profile`
- **Structure**: Career stats aggregation
- **Fields**: Total sessions, career high score, average accuracy, total tokens

### On-Chain Data

**Smart Contracts Store**:
- Token balances (ACT tokens per address)
- NFT ownership (cosmetics owned by each player)
- Reward history (transaction events)

**Query Pattern**:
```typescript
// Get on-chain balance
const balance = await aimChainToken.balanceOf(playerAddress);

// Get owned NFTs
const nftCount = await cosmeticsNFT.balanceOf(playerAddress);
const nfts = [];
for (let i = 0; i < nftCount; i++) {
  const tokenId = await cosmeticsNFT.tokenOfOwnerByIndex(playerAddress, i);
  nfts.push(tokenId);
}
```

---

## Development Workflow

### Local Development Setup

**1. Install Dependencies**
```bash
npm install
```

**2. Start Development Server**
```bash
npm run dev
# Vite server starts on http://localhost:3002
# Hot module replacement (HMR) enabled
```

**3. Compile Smart Contracts**
```bash
npm run compile:contracts
# Compiles Solidity contracts in contracts/
# Generates ABIs and bytecode
```

**4. Run Local Blockchain**
```bash
npm run deploy:local
# Starts Hardhat local node on port 8545
# Creates 20 test accounts with 10,000 ETH each
```

**5. Deploy Contracts Locally**
```bash
npm run deploy:contracts
# Deploys contracts to local Hardhat network
# Outputs contract addresses
```

**6. Test Smart Contracts**
```bash
npm run test:contracts
# Runs Mocha/Chai tests for contracts
```

### Development Tools

**Vite Dev Server Features**:
- **Instant HMR**: Code changes reflect in <1s
- **TypeScript compilation**: On-the-fly TS to JS
- **Source maps**: Debug TypeScript in browser
- **Fast refresh**: Phaser scenes reload without full page refresh

**Browser DevTools**:
- **Console**: `window.game` gives access to Phaser game instance
- **Performance**: Monitor FPS and frame timing
- **Network**: Track blockchain RPC calls
- **Application > localStorage**: View saved settings

### File Watchers

Vite watches these directories:
- `src/**/*.ts` - TypeScript source files
- `public/**/*` - Static assets
- `index.html` - HTML entry point

Changes trigger automatic rebuilds.

---

## Deployment Guide

### Smart Contract Deployment

**1. Configure Monad Network**

Add to `contracts/hardhat.config.ts`:
```typescript
networks: {
  monad: {
    url: process.env.MONAD_RPC_URL, // "https://rpc.monad.xyz"
    chainId: 10000,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    gas: 5000000,
    gasPrice: 20000000000 // 20 gwei
  }
}
```

**2. Set Environment Variables**

Create `.env` file:
```bash
MONAD_RPC_URL=https://rpc.monad.xyz
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**3. Deploy Contracts**

```bash
# Deploy to Monad
npx hardhat run scripts/deploy.ts --network monad

# Output:
# AimChainToken deployed to: 0xABC...123
# CosmeticsNFT deployed to: 0xDEF...456
# RewardsDistributor deployed to: 0xGHI...789
```

**4. Verify Contracts** (optional)

```bash
npx hardhat verify --network monad 0xABC...123 "1000000000000000000000000"
```

**5. Update Frontend**

Add contract addresses to `src/web3/config.ts`:
```typescript
export const CONTRACTS = {
  ACT_TOKEN: '0xABC...123',
  COSMETICS_NFT: '0xDEF...456',
  REWARDS_DISTRIBUTOR: '0xGHI...789'
};
```

### Frontend Deployment

**1. Build Production Assets**

```bash
npm run build
# Output: dist/ directory with optimized HTML/JS/CSS
```

**2. Deploy to Hosting**

**Option A: Vercel** (recommended)
```bash
npm install -g vercel
vercel deploy
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: IPFS** (decentralized)
```bash
npm install -g ipfs-deploy
ipd -p pinata dist/
# Returns IPFS hash: ipfs://Qm...
```

**3. Configure Domain**

Point your domain to deployment:
- Vercel: Add custom domain in dashboard
- Netlify: Configure DNS in settings
- IPFS: Use ENS or traditional DNS with IPFS gateway

### Post-Deployment Checklist

- [ ] Smart contracts deployed to Monad mainnet
- [ ] Contract addresses updated in frontend config
- [ ] Frontend deployed to hosting provider
- [ ] MetaMask can connect to Monad network
- [ ] Players can mint/claim tokens successfully
- [ ] NFT minting works correctly
- [ ] Leaderboard saves data to localStorage
- [ ] Settings persist across sessions

---

## Monitoring & Maintenance

### Smart Contract Monitoring

**1. Transaction Explorer**

Monitor contract interactions on Monad explorer:
- `https://explorer.monad.xyz/address/0xYOUR_CONTRACT_ADDRESS`

**2. Event Logs**

Listen for contract events:
```typescript
rewardsDistributor.on('RewardDistributed', (player, amount, event) => {
  console.log(`${player} earned ${amount} tokens`);
});
```

**3. Gas Usage**

Track gas costs per transaction:
```typescript
const tx = await contract.distributeReward(player, amount);
const receipt = await tx.wait();
console.log(`Gas used: ${receipt.gasUsed.toString()}`);
```

### Frontend Monitoring

**1. Error Tracking**

Integrate Sentry for error monitoring:
```typescript
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production'
});
```

**2. Analytics**

Track user behavior with Google Analytics:
```typescript
gtag('event', 'game_session_complete', {
  score: finalScore,
  accuracy: accuracy,
  tokens_earned: tokensEarned
});
```

**3. Performance**

Monitor FPS and frame drops:
```typescript
// In game update loop
if (game.loop.actualFps < 30) {
  console.warn('Low FPS detected:', game.loop.actualFps);
}
```

---

## Future Roadmap

### Planned Features

**Q1 2026**:
- [ ] CS:GO training mode implementation
- [ ] Valorant training mode implementation
- [ ] Leaderboard backend API (replace localStorage)
- [ ] NFT marketplace integration

**Q2 2026**:
- [ ] Multiplayer training (2-4 players)
- [ ] Clan/team system
- [ ] Tournament mode with prize pools
- [ ] Mobile responsive version

**Q3 2026**:
- [ ] VR support (WebXR)
- [ ] AI-powered coaching suggestions
- [ ] Replay system
- [ ] Social sharing features

**Q4 2026**:
- [ ] Cross-chain bridge (Ethereum, Polygon)
- [ ] DAO governance for game updates
- [ ] Staking rewards for token holders
- [ ] Season passes and battle passes

---

## Support & Community

### Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join community for discussions
- **Email**: support@aimchain.io
- **Documentation**: This file and linked resources

### Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### License

MIT License - see [LICENSE](LICENSE) file

---

## Technical Glossary

**EVM**: Ethereum Virtual Machine - executes smart contracts  
**ERC-20**: Fungible token standard (like ACT)  
**ERC-721**: Non-fungible token (NFT) standard  
**Gas**: Transaction fee on blockchain  
**Gwei**: Gas price unit (1 gwei = 0.000000001 ETH)  
**ABI**: Application Binary Interface - contract method definitions  
**Signer**: Authenticated wallet account that can sign transactions  
**Provider**: Connection to blockchain node (reads data)  
**MetaMask**: Browser wallet extension for Ethereum/Monad  
**IPFS**: InterPlanetary File System - decentralized storage  
**HMR**: Hot Module Replacement - live code updates  
**Phaser**: HTML5 game framework  
**Scene**: Game screen/level in Phaser  
**Container**: Group of game objects in Phaser  
**Tween**: Animation between two states  

---

## Conclusion

AimChain represents a new paradigm in gaming: **skill-based earning** meets **true digital ownership**. By leveraging the **Monad blockchain's** speed and efficiency with **Phaser 3's** robust game engine, we've created a training platform that's both fun and financially rewarding.

This documentation covers the entire technical architecture, from Solidity smart contracts to Phaser game loops. As the project evolves, this document will be updated to reflect new features and improvements.

**Ready to start training?**

```bash
npm install
npm run dev
# Open http://localhost:3002
# Connect MetaMask
# Start earning!
```

---

**Last Updated**: January 24, 2026  
**Version**: 1.0.0  
**Total Documentation**: ~15,000 words  
