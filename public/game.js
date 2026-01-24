import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// ===== WEB3 / MONAD BLOCKCHAIN SETUP =====
const MONAD_CONFIG = {
  chainId: '0x13A3', // 5027 in hex (Monad Testnet)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://rpc.testnet.monad.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
};

// Wallet state
let provider = null;
let signer = null;
let walletAddress = null;
let walletConnected = false;

// Connect to MetaMask and Monad network
const connectWallet = async () => {
  const walletBtn = document.getElementById('walletButton');
  
  if (!window.ethereum) {
    alert('❌ MetaMask not installed!\n\nPlease install MetaMask extension:\nhttps://metamask.io/download/');
    return false;
  }
  
  try {
    // Show loading state
    walletBtn.textContent = '⏳ Connecting...';
    walletBtn.style.background = 'linear-gradient(135deg, #FFA500, #FF8C00)';
    walletBtn.disabled = true;
    
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    walletAddress = accounts[0];
    console.log('📝 Account received:', walletAddress);
    
    // Check if on Monad network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 Current chain ID:', chainId);
    
    if (chainId !== MONAD_CONFIG.chainId) {
      console.log('⚠️ Not on Monad Testnet. Attempting to switch...');
      walletBtn.textContent = '⏳ Switching Network...';
      
      try {
        // Try to switch to Monad
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_CONFIG.chainId }],
        });
        console.log('✅ Switched to Monad Testnet');
      } catch (switchError) {
        console.log('⚠️ Switch error:', switchError);
        // Network not added, add it
        if (switchError.code === 4902) {
          console.log('➕ Adding Monad Testnet...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_CONFIG],
          });
          console.log('✅ Monad Testnet added');
        } else {
          throw switchError;
        }
      }
    }
    
    walletConnected = true;
    walletBtn.disabled = false;
    
    console.log('✅ Wallet connected:', walletAddress);
    console.log('🌐 Network: Monad Testnet');
    
    updateWalletUI();
    
    // Show success alert with address
    setTimeout(() => {
      alert(`✅ Connected to Monad Testnet!\n\nYour Address:\n${walletAddress}`);
    }, 100);
    
    return true;
    
  } catch (error) {
    console.error('❌ Wallet connection failed:', error);
    walletConnected = false;
    walletAddress = null;
    walletBtn.disabled = false;
    updateWalletUI();
    
    if (error.code === 4001) {
      alert('❌ Connection rejected!\n\nYou rejected the connection request.');
    } else {
      alert('❌ Failed to connect wallet:\n\n' + error.message);
    }
    return false;
  }
};

// Disconnect wallet
const disconnectWallet = () => {
  walletAddress = null;
  walletConnected = false;
  provider = null;
  signer = null;
  updateWalletUI();
  console.log('🔓 Wallet disconnected');
};

// Update wallet UI
const updateWalletUI = () => {
  const walletBtn = document.getElementById('walletButton');
  const walletInfo = document.getElementById('walletInfo');
  const profileBtn = document.getElementById('profileButton');
  const walletStatusHome = document.getElementById('walletStatusHome');
  
  if (!walletBtn || !walletInfo) {
    console.warn('⚠️ Wallet UI elements not found yet');
    return;
  }
  
  if (walletConnected && walletAddress) {
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    walletBtn.textContent = `✅ ${shortAddr}`;
    walletBtn.style.background = 'linear-gradient(135deg, #00ff00, #00aa00)';
    walletBtn.disabled = false;
    walletBtn.onclick = () => {
      const message = `Your MetaMask Address:\n\n${walletAddress}\n\nNetwork: Monad Testnet\n\n(Address copied to clipboard!)`;
      navigator.clipboard.writeText(walletAddress).then(() => {
        alert(message);
      }).catch(() => {
        alert(`Your MetaMask Address:\n\n${walletAddress}\n\nNetwork: Monad Testnet`);
      });
    };
    walletInfo.style.display = 'block';
    walletInfo.textContent = `🟢 Connected: ${shortAddr}`;
    
    // Show profile button
    if (profileBtn) {
      profileBtn.style.display = 'block';
    }
    
    // Update home page wallet status
    if (walletStatusHome) {
      walletStatusHome.textContent = '✅ Wallet Connected';
      walletStatusHome.className = 'connected';
    }
    
    console.log('🔗 Wallet UI updated - Connected');
  } else {
    walletBtn.textContent = '🔗 CONNECT WALLET';
    walletBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    walletBtn.disabled = false;
    walletBtn.onclick = connectWallet;
    walletInfo.style.display = 'none';
    
    // Hide profile button
    if (profileBtn) {
      profileBtn.style.display = 'none';
    }
    
    // Update home page wallet status
    if (walletStatusHome) {
      walletStatusHome.textContent = '❌ Wallet Not Connected';
      walletStatusHome.className = 'disconnected';
    }
    
    console.log('🔗 Wallet UI updated - Disconnected');
  }
};

// Distribute rewards after session
const distributeRewards = async (score, accuracy) => {
  if (!walletConnected) {
    console.log('⚠️ Wallet not connected. Rewards not distributed.');
    return;
  }
  
  // Calculate tokens earned
  const baseTokens = Math.floor(score / 10); // 10 points = 1 ACT token
  const accuracyBonus = accuracy >= 80 ? 50 : 0; // 50 bonus for 80%+ accuracy
  const totalTokens = baseTokens + accuracyBonus;
  
  console.log(`🪙 Tokens earned: ${totalTokens} ACT`);
  console.log(`   - Base reward: ${baseTokens} ACT`);
  console.log(`   - Accuracy bonus: ${accuracyBonus} ACT`);
  
  // TODO: Call smart contract to mint tokens
  // This requires the RewardsDistributor contract to be deployed
  // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  // const tx = await contract.distributeReward(walletAddress, totalTokens);
  // await tx.wait();
  
  alert(
    `🎉 Session Complete!\n\n` +
    `💰 Tokens Earned: ${totalTokens} ACT\n` +
    `   Base: ${baseTokens} ACT\n` +
    `   Bonus: ${accuracyBonus} ACT\n\n` +
    `📝 Deploy smart contracts to receive tokens on-chain!`
  );
};

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 0, 750); // Distance fog for depth

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75, // FOV (field of view)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
camera.position.set(0, 1.6, 0); // Eye level height (1.6 meters)

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ===== POINTER LOCK CONTROLS =====
const controls = new PointerLockControls(camera, document.body);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const playButton = document.getElementById('playButton');
const crosshair = document.getElementById('crosshair');
const hud = document.getElementById('hud');

// Click to start
playButton.addEventListener('click', () => {
  controls.lock();
});

// Pointer lock event listeners
controls.addEventListener('lock', () => {
  instructions.style.display = 'none';
  blocker.style.display = 'none';
  crosshair.style.display = 'block';
  hud.style.display = 'block';
  isPaused = false;
  console.log('🎮 Pointer locked! Move your mouse to look around.');
});

controls.addEventListener('unlock', () => {
  blocker.style.display = 'block';
  instructions.style.display = '';
  crosshair.style.display = 'none';
  hud.style.display = 'none';
  isPaused = true;
  console.log('🔓 Pointer unlocked. Press CTRL or click START TRAINING to lock again.');
});

scene.add(controls.getObject());

// ===== LIGHTING =====
// Ambient light for overall brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Directional light (sun) with shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// ===== ENVIRONMENT - SHOOTING RANGE =====
// Ground (dirt)
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7a6c4f, // Dirt brown
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Back wall
const wallGeometry = new THREE.BoxGeometry(100, 15, 1);
const wallMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8b7355, // Brown wood
  roughness: 0.7,
  metalness: 0.2
});
const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
backWall.position.set(0, 7.5, -50);
backWall.receiveShadow = true;
backWall.castShadow = true;
scene.add(backWall);

// Side walls
const sideWallGeometry = new THREE.BoxGeometry(1, 15, 100);
const sideWall1 = new THREE.Mesh(sideWallGeometry, wallMaterial);
sideWall1.position.set(-50, 7.5, 0);
sideWall1.receiveShadow = true;
sideWall1.castShadow = true;
scene.add(sideWall1);

const sideWall2 = sideWall1.clone();
sideWall2.position.set(50, 7.5, 0);
scene.add(sideWall2);

// Add some depth markers (poles at various distances)
for (let i = 1; i <= 5; i++) {
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(-45, 1.5, -10 * i);
  pole.castShadow = true;
  pole.receiveShadow = true;
  scene.add(pole);
  
  const pole2 = pole.clone();
  pole2.position.set(45, 1.5, -10 * i);
  scene.add(pole2);
}

// ===== WEAPON - AK-47 VIEWMODEL =====
let weapon, weaponGroup;

// Create weapon group (container for weapon + effects)
weaponGroup = new THREE.Group();
camera.add(weaponGroup); // Attach to camera so it moves with view

// Create AK-47 placeholder (simplified geometry)
const createWeapon = () => {
  // Weapon body
  const bodyGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c2c2c,
    metalness: 0.7,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
  // Barrel
  const barrelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
  const barrelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    metalness: 0.9,
    roughness: 0.2
  });
  const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(0, 0.04, -0.6);
  
  // Magazine
  const magGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.1);
  const magMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a3a,
    metalness: 0.5,
    roughness: 0.5
  });
  const magazine = new THREE.Mesh(magGeometry, magMaterial);
  magazine.position.set(0, -0.15, -0.1);
  
  // Stock
  const stockGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.3);
  const stockMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5a4a3a,
    roughness: 0.8
  });
  const stock = new THREE.Mesh(stockGeometry, stockMaterial);
  stock.position.set(0, 0, 0.25);
  
  // ===== ARMS/HANDS HOLDING WEAPON =====
  // Skin color material
  const skinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4a574, // Tan skin color
    roughness: 0.6
  });
  
  // Sleeve material (tactical uniform)
  const sleeveMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a4a2a, // Dark olive green
    roughness: 0.8
  });
  
  // RIGHT ARM (holding pistol grip)
  const rightForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.25, 8),
    sleeveMaterial
  );
  rightForearm.rotation.z = -0.3;
  rightForearm.position.set(0.15, -0.15, -0.15);
  
  // Right hand
  const rightHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.08, 0.1),
    skinMaterial
  );
  rightHand.position.set(0.08, -0.18, -0.05);
  rightHand.rotation.z = -0.2;
  
  // Right fingers (simple boxes)
  const rightFingers = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.06, 0.08),
    skinMaterial
  );
  rightFingers.position.set(0.05, -0.2, -0.03);
  
  // LEFT ARM (holding foregrip/barrel)
  const leftForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.3, 8),
    sleeveMaterial
  );
  leftForearm.rotation.z = 0.5;
  leftForearm.rotation.x = 0.2;
  leftForearm.position.set(-0.05, -0.1, -0.4);
  
  // Left hand
  const leftHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.08, 0.1),
    skinMaterial
  );
  leftHand.position.set(-0.08, -0.08, -0.55);
  leftHand.rotation.z = 0.3;
  leftHand.rotation.x = -0.2;
  
  // Left fingers gripping barrel
  const leftFingers = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.06, 0.08),
    skinMaterial
  );
  leftFingers.position.set(-0.08, -0.05, -0.6);
  leftFingers.rotation.x = -0.3;
  
  // Right thumb
  const rightThumb = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.05, 0.03),
    skinMaterial
  );
  rightThumb.position.set(0.11, -0.16, -0.05);
  rightThumb.rotation.z = 0.5;
  
  // Combine all parts
  weapon = new THREE.Group();
  weapon.add(body);
  weapon.add(barrel);
  weapon.add(magazine);
  weapon.add(stock);
  
  // Add arms and hands
  weapon.add(rightForearm);
  weapon.add(rightHand);
  weapon.add(rightFingers);
  weapon.add(rightThumb);
  weapon.add(leftForearm);
  weapon.add(leftHand);
  weapon.add(leftFingers);
  
  // Position weapon in bottom-right of view
  weapon.position.set(0.25, -0.2, -0.5);
  weapon.rotation.y = -0.1;
  weapon.rotation.x = 0.05;
  
  weaponGroup.add(weapon);
  
  // Weapon idle animation (breathing sway)
  let time = 0;
  const animateWeapon = () => {
    if (weapon && !isReloading) {
      time += 0.01;
      weapon.position.y = -0.2 + Math.sin(time) * 0.004;
      weapon.rotation.z = Math.sin(time * 0.5) * 0.008;
    }
  };
  
  return animateWeapon;
};

const weaponAnimation = createWeapon();

// ===== BULLSEYE TARGETS =====
const targets = [];
const targetMeshes = []; // For raycasting

const createBullseyeTarget = (x, y, z) => {
  const targetGroup = new THREE.Group();
  
  // Target board (wooden background)
  const boardGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
  const boardMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b7355,
    roughness: 0.8
  });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.castShadow = true;
  board.receiveShadow = true;
  targetGroup.add(board);
  
  // Outer ring (red)
  const outerRingGeometry = new THREE.CircleGeometry(0.6, 32);
  const outerRingMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff4444,
    side: THREE.DoubleSide
  });
  const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
  outerRing.position.z = 0.06;
  targetGroup.add(outerRing);
  
  // Middle ring (white)
  const middleRingGeometry = new THREE.CircleGeometry(0.4, 32);
  const middleRingMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  const middleRing = new THREE.Mesh(middleRingGeometry, middleRingMaterial);
  middleRing.position.z = 0.07;
  targetGroup.add(middleRing);
  
  // Bullseye (yellow)
  const bullseyeGeometry = new THREE.CircleGeometry(0.2, 32);
  const bullseyeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffdd00,
    side: THREE.DoubleSide
  });
  const bullseye = new THREE.Mesh(bullseyeGeometry, bullseyeMaterial);
  bullseye.position.z = 0.08;
  targetGroup.add(bullseye);
  
  // Position target
  targetGroup.position.set(x, y, z);
  targetGroup.lookAt(camera.position); // Face camera
  
  scene.add(targetGroup);
  
  // Store target data
  const targetData = {
    group: targetGroup,
    position: new THREE.Vector3(x, y, z),
    outerRadius: 0.6,
    middleRadius: 0.4,
    bullseyeRadius: 0.2,
    isActive: true,
    board: board
  };
  
  targets.push(targetData);
  targetMeshes.push(board); // For raycasting
  
  return targetData;
};

// Spawn random target
const spawnRandomTarget = () => {
  const x = (Math.random() - 0.5) * 40; // -20 to 20
  const y = 1.2 + Math.random() * 2.5; // 1.2 to 3.7 meters high
  const z = -10 - Math.random() * 30; // 10 to 40 meters away
  return createBullseyeTarget(x, y, z);
};

// Spawn initial targets (3 targets)
for (let i = 0; i < 3; i++) {
  spawnRandomTarget();
}

// ===== SHOOTING MECHANICS =====
let ammo = 30;
let reserveAmmo = 90;
let isReloading = false;
let shotsFired = 0;
let shotsHit = 0;
let isPaused = true;

const raycaster = new THREE.Raycaster();
const shootDirection = new THREE.Vector3();

const shoot = () => {
  if (ammo <= 0 || isReloading || isPaused) {
    // Empty chamber click
    console.log('Click! (no ammo)');
    return;
  }
  
  ammo--;
  shotsFired++;
  document.getElementById('ammo').textContent = `${ammo}/${reserveAmmo}`;
  
  // Update accuracy
  updateAccuracy();
  
  // Weapon recoil animation
  if (weapon) {
    weapon.position.y -= 0.05;
    weapon.rotation.x -= 0.1;
    weapon.rotation.y += (Math.random() - 0.5) * 0.02; // Horizontal recoil
    
    setTimeout(() => {
      weapon.position.y = -0.2;
      weapon.rotation.x = 0.05;
      weapon.rotation.y = -0.1;
    }, 100);
  }
  
  // Muzzle flash
  const flash = new THREE.PointLight(0xffaa00, 3, 5);
  flash.position.set(0.25, -0.15, -0.9);
  weaponGroup.add(flash);
  setTimeout(() => weaponGroup.remove(flash), 50);
  
  // Raycast from camera center
  camera.getWorldDirection(shootDirection);
  raycaster.set(camera.position, shootDirection);
  
  // Check intersections with target boards
  const intersects = raycaster.intersectObjects(targetMeshes);
  
  if (intersects.length > 0) {
    const hitPoint = intersects[0].point;
    
    // Find which target was hit
    for (let target of targets) {
      if (!target.isActive) continue;
      
      const distance = hitPoint.distanceTo(target.position);
      
      if (distance <= target.outerRadius) {
        let points = 0;
        let hitType = '';
        
        if (distance <= target.bullseyeRadius) {
          points = 10;
          hitType = 'BULLSEYE! 🎯';
          console.log('BULLSEYE! +10 points');
        } else if (distance <= target.middleRadius) {
          points = 8;
          hitType = 'Middle Ring!';
          console.log('Middle ring! +8 points');
        } else {
          points = 5;
          hitType = 'Outer Ring';
          console.log('Outer ring! +5 points');
        }
        
        updateScore(points);
        shotsHit++;
        updateAccuracy();
        
        // Show hit marker
        showHitMarker(hitPoint, points, hitType);
        
        // Destroy target and spawn new one
        scene.remove(target.group);
        const index = targets.indexOf(target);
        if (index > -1) {
          targets.splice(index, 1);
          targetMeshes.splice(index, 1);
        }
        
        // Spawn new target after short delay
        setTimeout(() => {
          spawnRandomTarget();
        }, 200);
        
        break;
      }
    }
  } else {
    console.log('Miss!');
  }
};

// Show hit marker at impact point
const showHitMarker = (position, points, hitType) => {
  // Create floating text sprite
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  
  context.fillStyle = points >= 10 ? '#ffdd00' : (points >= 8 ? '#00ff00' : '#ffffff');
  context.font = 'bold 48px Arial';
  context.textAlign = 'center';
  context.fillText(`+${points}`, 128, 64);
  context.font = 'bold 24px Arial';
  context.fillText(hitType, 128, 100);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position);
  sprite.scale.set(2, 1, 1);
  scene.add(sprite);
  
  // Animate upward and fade out
  let opacity = 1;
  const animateMarker = () => {
    sprite.position.y += 0.02;
    opacity -= 0.02;
    sprite.material.opacity = opacity;
    
    if (opacity > 0) {
      requestAnimationFrame(animateMarker);
    } else {
      scene.remove(sprite);
    }
  };
  animateMarker();
};

// Mouse click to shoot
document.addEventListener('mousedown', (event) => {
  if (controls.isLocked && event.button === 0) {
    shoot();
  }
});

// Reload
const reload = () => {
  if (isReloading || ammo === 30 || reserveAmmo === 0) return;
  
  isReloading = true;
  console.log('Reloading...');
  
  // Visual reload animation
  if (weapon) {
    const originalY = weapon.position.y;
    weapon.position.y -= 0.3; // Drop weapon down
    
    setTimeout(() => {
      weapon.position.y = originalY;
    }, 1500);
  }
  
  setTimeout(() => {
    const needed = 30 - ammo;
    const toReload = Math.min(needed, reserveAmmo);
    ammo += toReload;
    reserveAmmo -= toReload;
    isReloading = false;
    document.getElementById('ammo').textContent = `${ammo}/${reserveAmmo}`;
    console.log('Reload complete!');
  }, 2000); // 2 second reload time
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === 'R') {
    reload();
  }
  
  // CTRL to toggle pointer lock
  if (event.key === 'Control') {
    if (controls.isLocked) {
      controls.unlock();
    } else {
      controls.lock();
    }
  }
});

// ===== SCORE SYSTEM =====
let score = 0;

const updateScore = (points) => {
  score += points;
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('hits').textContent = shotsHit;
  
  // Update profile stats
  updateProfileStats();
};

const updateAccuracy = () => {
  const accuracy = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : 0;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  
  // Update profile stats
  updateProfileStats();
};

// Update profile stats in real-time
const updateProfileStats = () => {
  const profileScore = document.getElementById('profileScore');
  const profileAccuracy = document.getElementById('profileAccuracy');
  const profileHits = document.getElementById('profileHits');
  const profileShots = document.getElementById('profileShots');
  
  if (profileScore) profileScore.textContent = score;
  if (profileHits) profileHits.textContent = shotsHit;
  if (profileShots) profileShots.textContent = shotsFired;
  
  if (profileAccuracy) {
    const accuracy = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : 0;
    profileAccuracy.textContent = `${accuracy}%`;
  }
};

// Open profile modal
const openProfile = () => {
  const profileModal = document.getElementById('profileModal');
  const profileAddress = document.getElementById('profileAddress');
  const profileNetwork = document.getElementById('profileNetwork');
  const profileStatus = document.getElementById('profileStatus');
  
  if (!profileModal) return;
  
  profileModal.style.display = 'flex';
  
  // Update profile info
  if (walletConnected && walletAddress) {
    if (profileAddress) {
      profileAddress.textContent = walletAddress;
      profileAddress.onclick = () => {
        navigator.clipboard.writeText(walletAddress).then(() => {
          alert('✅ Address copied to clipboard!');
        });
      };
    }
    if (profileNetwork) {
      profileNetwork.textContent = '🌐 Monad Testnet';
    }
    if (profileStatus) {
      profileStatus.textContent = '✅ Connected to Monad Testnet';
    }
  } else {
    if (profileAddress) profileAddress.textContent = 'Not Connected';
    if (profileNetwork) profileNetwork.textContent = 'Not Connected';
    if (profileStatus) profileStatus.textContent = '❌ Wallet Not Connected';
  }
  
  // Update stats
  updateProfileStats();
};

// Close profile modal
const closeProfile = () => {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.style.display = 'none';
  }
};

// ===== MOVEMENT (WASD) =====
const moveSpeed = 0.15;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveState.forward = true; break;
    case 'KeyS': moveState.backward = true; break;
    case 'KeyA': moveState.left = true; break;
    case 'KeyD': moveState.right = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveState.forward = false; break;
    case 'KeyS': moveState.backward = false; break;
    case 'KeyA': moveState.left = false; break;
    case 'KeyD': moveState.right = false; break;
  }
});

// ===== GAME LOOP =====
const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update weapon animation
  if (weaponAnimation) {
    weaponAnimation();
  }
  
  // Update movement
  if (controls.isLocked) {
    velocity.x = 0;
    velocity.z = 0;
    
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
    
    // Keep camera at eye level
    camera.position.y = 1.6;
  }
  
  // Update targets to face camera
  targets.forEach(target => {
    if (target.group) {
      target.group.lookAt(camera.position);
    }
  });
  
  renderer.render(scene, camera);
};

animate();

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== TIMER =====
let timeRemaining = 60;
const timerElement = document.getElementById('timer');

const timerInterval = setInterval(() => {
  if (controls.isLocked && timeRemaining > 0 && !isPaused) {
    timeRemaining--;
    timerElement.textContent = `${timeRemaining}s`;
    
    if (timeRemaining === 0) {
      controls.unlock();
      
      const accuracy = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : 0;
      
      // Distribute rewards via blockchain
      distributeRewards(score, parseFloat(accuracy));
      
      // Reset for next session
      timeRemaining = 60;
      score = 0;
      shotsFired = 0;
      shotsHit = 0;
      ammo = 30;
      reserveAmmo = 90;
      
      document.getElementById('score').textContent = 'Score: 0';
      document.getElementById('accuracy').textContent = '0%';
      document.getElementById('ammo').textContent = '30/90';
      document.getElementById('timer').textContent = '60s';
      document.getElementById('hits').textContent = '0';
    }
  }
}, 1000);

// ===== WALLET BUTTON EVENT =====
// Wait for DOM to be ready before setting up wallet button
const initWalletButton = () => {
  const walletBtn = document.getElementById('walletButton');
  const walletInfo = document.getElementById('walletInfo');
  const profileBtn = document.getElementById('profileButton');
  const closeProfileBtn = document.getElementById('closeProfile');
  const profileModal = document.getElementById('profileModal');
  
  if (!walletBtn || !walletInfo) {
    console.error('❌ Wallet UI elements not found!');
    return;
  }
  
  console.log('✅ Wallet button initialized');
  updateWalletUI();
  
  // Profile button click
  if (profileBtn) {
    profileBtn.onclick = openProfile;
  }
  
  // Close profile button
  if (closeProfileBtn) {
    closeProfileBtn.onclick = closeProfile;
  }
  
  // Close profile when clicking outside
  if (profileModal) {
    profileModal.onclick = (e) => {
      if (e.target === profileModal) {
        closeProfile();
      }
    };
  }
  
  // Listen for MetaMask account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        console.log('🔓 MetaMask disconnected');
        disconnectWallet();
      } else {
        // User switched accounts
        walletAddress = accounts[0];
        walletConnected = true;
        console.log('🔄 Account switched to:', walletAddress);
        updateWalletUI();
      }
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('🔄 Chain changed to:', chainId);
      // Reload the page when chain changes
      window.location.reload();
    });
  }
};

// Initialize wallet button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWalletButton);
} else {
  // DOM already loaded
  initWalletButton();
}

console.log('🎮 AimChain Three.js FPS Aim Trainer initialized!');
console.log('📦 Targets spawned:', targets.length);
console.log('🎯 Click START TRAINING to begin!');
console.log('🔗 Click "Connect Wallet" to link your MetaMask wallet!');
