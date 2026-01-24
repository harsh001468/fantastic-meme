// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CosmeticsNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    string private baseTokenURI;

    event Minted(address indexed owner, uint256 indexed tokenId);

    constructor(string memory name, string memory symbol, string memory _baseTokenURI) 
        ERC721(name, symbol) {
        baseTokenURI = _baseTokenURI;
    }

    function mint(address to) external onlyOwner {
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
}