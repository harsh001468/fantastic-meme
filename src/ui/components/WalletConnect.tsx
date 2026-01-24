import React, { useEffect, useState } from 'react';
import walletService from '../../web3/services/WalletService';

const WalletConnect: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>('0');
    const [isHovered, setIsHovered] = useState(false);

    const checkBalance = async (address: string) => {
        try {
            const bal = await walletService.getBalance(address);
            setBalance(parseFloat(bal).toFixed(4));
        } catch (e) {
            console.error(e);
        }
    }

    const connectWallet = async () => {
        try {
            const address = await walletService.connect();
            setWalletAddress(address);
            setIsConnected(true);
            checkBalance(address);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const disconnectWallet = () => {
        walletService.disconnectWallet();
        setWalletAddress(null);
        setIsConnected(false);
    };

    useEffect(() => {
        const checkConnection = async () => {
            const address = await walletService.getConnectedAddress();
            if (address) {
                setWalletAddress(address);
                setIsConnected(true);
                checkBalance(address);
            }
        };
        checkConnection();
    }, []);

    // Professional Styles (Glassmorphism + Cyberpunk)
    const buttonStyle: React.CSSProperties = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 'bold',
        background: isConnected
            ? 'rgba(20, 20, 30, 0.85)'
            : 'linear-gradient(135deg, #4CAF50, #45a049)',
        border: isConnected ? '1px solid #00d4ff' : '2px solid #fff',
        color: isConnected ? '#00d4ff' : '#fff',
        borderRadius: '30px',
        cursor: 'pointer',
        zIndex: 10000,
        boxShadow: isConnected
            ? '0 0 15px rgba(0, 212, 255, 0.2), inset 0 0 10px rgba(0,212,255,0.1)'
            : '0 0 20px rgba(76, 175, 80, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        outline: 'none',
        backdropFilter: 'blur(10px)',
        fontFamily: "'Arial', sans-serif"
    };

    const statusDot: React.CSSProperties = {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isConnected ? '#00ff88' : '#e0e0e0',
        boxShadow: isConnected ? '0 0 8px #00ff88' : 'none'
    };

    const balanceStyle: React.CSSProperties = {
        color: '#ffffff',
        borderLeft: '1px solid rgba(255,255,255,0.3)',
        paddingLeft: '12px',
        marginLeft: '4px',
        opacity: 0.9
    };

    return (
        <button
            style={buttonStyle}
            onClick={isConnected ? disconnectWallet : connectWallet}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={statusDot}></div>
            {isConnected ? (
                <>
                    <span>{walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}</span>
                    <span style={balanceStyle}>{balance} MON</span>
                </>
            ) : (
                "Connect Wallet"
            )}
        </button>
    );
};

export default WalletConnect;