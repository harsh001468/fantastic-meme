import { ethers } from 'ethers';

export class ContractService {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;

    constructor() {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
        }
    }

    async connectWallet() {
        if (!this.provider) {
            throw new Error('No provider available');
        }
        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
    }

    async getTokenBalance(address: string): Promise<string> {
        console.log('Getting token balance for:', address);
        // Will implement after contract deployment
        return '0';
    }

    async distributeRewards(address: string, amount: number): Promise<any> {
        console.log('Distributing rewards:', { address, amount });
        return null;
    }

    async callContractMethod(contract: ethers.Contract, methodName: string, ...args: any[]) {
        return await contract[methodName](...args);
    }

    async sendTransaction(contract: ethers.Contract, methodName: string, ...args: any[]) {
        const tx = await contract[methodName](...args);
        await tx.wait();
        return tx;
    }
}