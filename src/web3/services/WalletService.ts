import { ethers } from 'ethers';

export class WalletService {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;
    private address: string | null = null;

    async connect(): Promise<string> {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
            await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

            // Switch to Monad network
            await this.switchToMonad();

            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();
            return this.address;
        } else {
            throw new Error('MetaMask is not installed');
        }
    }

    async switchToMonad() {
        if (!(window as any).ethereum) return;

        const MONAD_CHAIN_ID = '0x279f'; // 10143
        const MONAD_RPC_URL = 'https://rpc.monad.xyz';
        const MONAD_EXPLORER_URL = 'https://explorer.monad.xyz';

        // ... (rest is same, implied) ...
        try {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: MONAD_CHAIN_ID }],
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: MONAD_CHAIN_ID,
                                chainName: 'Monad Testnet',
                                rpcUrls: [MONAD_RPC_URL],
                                iconUrls: [],
                                blockExplorerUrls: [MONAD_EXPLORER_URL],
                                nativeCurrency: {
                                    name: 'Monad',
                                    symbol: 'MON',
                                    decimals: 18,
                                },
                            },
                        ],
                    });
                } catch (addError) {
                    console.error('Failed to add Monad network', addError);
                }
            }
        }
    }

    async hasAntiGravityItem(address: string): Promise<boolean> {
        // In a real implementation, this would call the ERC-721 contract.
        // For this demo, we assume any connected user has the boots.
        return !!address;
    }

    async getBalance(address: string): Promise<string> {
        if (!this.provider) {
            // Try to reconnect provider if missing but window available
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
            } else {
                throw new Error('Wallet not connected');
            }
        }
        if (!this.provider) throw new Error('Wallet not connected');

        const balance = await this.provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    }

    async signMessage(message: string): Promise<string> {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }
        return await this.signer.signMessage(message);
    }

    async disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.address = null;
    }

    async getConnectedAddress(): Promise<string | null> {
        if (this.address) return this.address;

        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
                const accounts = await this.provider.listAccounts();
                if (accounts.length > 0) {
                    this.address = accounts[0];
                    this.signer = this.provider.getSigner();
                    // Optionally verification of network here
                    return this.address;
                }
            } catch (e) {
                console.error("Error checking connection", e);
            }
        }
        return null;
    }
}

export default new WalletService();