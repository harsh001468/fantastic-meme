# AimChain Testing Guide

## Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run Development Server
```powershell
npm run dev
```

The game will automatically open in your browser at `http://localhost:3000`

## Available Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Smart Contracts
- `npm run compile:contracts` - Compile smart contracts
- `npm run test:contracts` - Run contract tests
- `npm run deploy:local` - Start local Hardhat node
- `npm run deploy:contracts` - Deploy contracts to local network

## Testing Features

### Game Testing
1. **Main Menu** - Test navigation and UI
2. **Training Scene** - Test aim training mechanics
   - Target spawning
   - Hit detection
   - Score tracking
   - Timer functionality
3. **Leaderboard** - View high scores

### Web3 Testing (Optional)
1. Install MetaMask browser extension
2. Connect wallet in-game
3. Test NFT minting
4. Test reward distribution

## Testing Checklist

- [ ] Game loads without errors
- [ ] Main menu displays correctly
- [ ] Can start training session
- [ ] Targets spawn properly
- [ ] Crosshair moves smoothly
- [ ] Hit detection works
- [ ] Score updates correctly
- [ ] Audio plays (if implemented)
- [ ] Can return to main menu
- [ ] Wallet connection works (Web3)

## Troubleshooting

### Game doesn't load
- Check browser console for errors (F12)
- Ensure all dependencies are installed
- Try clearing browser cache

### Port 3000 already in use
```powershell
# Kill the process using port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```
Then run `npm run dev` again

### TypeScript errors
```powershell
npm run build
```
Check for any compilation errors

## Performance Testing

- Open browser DevTools (F12)
- Go to Performance tab
- Record gameplay session
- Check FPS (should be 60fps)
- Monitor memory usage

## Debugging

### Enable Phaser Debug Mode
Edit [src/index.ts](src/index.ts#L16) and set:
```typescript
physics: {
  arcade: {
    debug: true  // Shows collision boxes
  }
}
```

### Browser Console
Press F12 to open developer tools and check:
- Console logs
- Network requests
- Errors and warnings

## Next Steps

After basic testing works:
1. Implement missing game features
2. Add sound effects and music
3. Complete Web3 integration
4. Deploy contracts to testnet
5. Full integration testing
