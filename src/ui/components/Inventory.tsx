import React from 'react';

const Inventory: React.FC = () => {
    const [nfts, setNfts] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Fetch the player's NFTs and cosmetics from the blockchain
        const fetchNFTs = async () => {
            // Placeholder for fetching logic
            const fetchedNFTs: any[] = []; // Replace with actual fetching logic
            setNfts(fetchedNFTs);
        };

        fetchNFTs();
    }, []);

    return (
        <div className="inventory">
            <h2>Your Inventory</h2>
            <ul>
                {nfts.map((nft, index) => (
                    <li key={index}>
                        <img src={nft.image} alt={nft.name} />
                        <p>{nft.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;