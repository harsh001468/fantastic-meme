export interface AimChainToken {
    totalSupply: () => Promise<number>;
    balanceOf: (address: string) => Promise<number>;
    transfer: (to: string, amount: number) => Promise<boolean>;
    approve: (spender: string, amount: number) => Promise<boolean>;
    allowance: (owner: string, spender: string) => Promise<number>;
}

export interface CosmeticsNFT {
    mint: (to: string, tokenId: number) => Promise<boolean>;
    transferFrom: (from: string, to: string, tokenId: number) => Promise<boolean>;
    ownerOf: (tokenId: number) => Promise<string>;
    getTokenURI: (tokenId: number) => Promise<string>;
}

export interface RewardsDistributor {
    distributeRewards: (playerAddress: string, score: number) => Promise<boolean>;
    getPlayerRewards: (playerAddress: string) => Promise<number>;
}

export interface BlockchainEvent {
    event: string;
    returnValues: Record<string, any>;
    blockNumber: number;
    transactionHash: string;
}