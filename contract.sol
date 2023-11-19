// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NFTContract is ERC1155 {
    struct Collection {
        string name;
        // if collection closed - u cant sell this collection nfts 
        bool isOpen;
        uint[] nftIds;
    }

    struct NFT {
        address owner;
        string name;
        // true - common NFT, false - collection NFT
        bool isCollectible;
        uint collectionId;

        string pictureLink;
    }

    struct CollectionSaleData {
        uint price;
        bool isValid;
    }

    struct NFTSaleData {
        uint price;
        bool isValid;
    }

    struct Bid {
        address bidder;
        uint amount;
    }

    struct Auction {
        uint startPrice;
        uint maxPrice;
        Bid[] bids;
        bool isValid;
    }

    Collection[] public collections;
    NFT[] public nfts;
    Auction[] public auctions;

    mapping (uint => CollectionSaleData) public collectionSaleData;
    mapping (uint => NFTSaleData) public nftSaleData;
    mapping (uint => Auction) public collectionAuctions;

    address public owner = msg.sender;
    constructor() ERC1155("https://game.example/api/item/1.json") {
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Owner only");
        _;
    }

    function getCollections() public view returns (Collection[] memory) {
        return collections;
    }

    function getNfts() public view returns (NFT[] memory) {
        return nfts;
    }

    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }

    function getAuction(uint collectionId) public view returns (Auction memory) {
        return collectionAuctions[collectionId];
    }

    function getSaleData(uint id) public  view returns (NFTSaleData memory) {
        return  nftSaleData[id];
    }

    function getCollectionOwner(uint id) public view returns (address) {
        return nfts[collections[id].nftIds[0]].owner;
    } 

    function createCommonNft(string calldata name, string calldata pictureLink) public onlyOwner returns(uint) {
        uint nftId = nfts.length;
        nfts.push(NFT(msg.sender, name, false, 0, pictureLink));
        _mint(msg.sender, nftId, 1, "");
        return nftId;
    }

    function createCollectibleNft(string calldata name, uint collectionId, string calldata pictureLink) public onlyOwner returns(uint) {
        uint nftId = nfts.length;
        nfts.push(NFT(msg.sender, name, true, collectionId, pictureLink));
        collections[collectionId - 1].nftIds.push(nftId);
        _mint(msg.sender, nftId, 1, "");
        return nftId;
    }

    function createCollection(string calldata name) public onlyOwner returns(uint) {
        uint collectionId = collections.length;
        collections.push(Collection(name, false, new uint[](0)));
        return collectionId;
    }

    function placeNftOnSale(uint id, uint price) public {
        NFT storage nft = nfts[id];
        require(nft.owner == msg.sender, "You dont own this NFT");
        require(!nftSaleData[id].isValid, "This NFT is already on sale");
        require(!nft.isCollectible || (nft.isCollectible && collections[nft.collectionId].isOpen), "This collectible NFT belongs to a closed collection");

        nftSaleData[id].price = price;
        nftSaleData[id].isValid = true;
    }

    function NFTbuy(uint id) public payable {
        NFT storage nft = nfts[id];
        // require(nft.owner != msg.sender, "You already own this NFT");
        // require(nftSaleData[id].isValid, "This NFT is not on sale");
        // require(!nft.isCollectible || (nft.isCollectible && collections[nft.collectionId].isOpen), "This collectible NFT belongs to a closed collection");
        // require(nftSaleData[id].price == msg.value, "Invalid value");

        payable(nfts[id].owner).transfer(msg.value);

        nft.owner = msg.sender;
        nftSaleData[id].isValid = false;
    }

    function startAuction(uint id, uint startPrice, uint maxPrice) public {
        NFT storage nft = nfts[id];
        require(nft.owner == msg.sender, "Unauthorized: You do not own this NFT");
        require(nft.isCollectible && !collections[id].isOpen, "This collection is open");
        
        Auction storage auction = collectionAuctions[id];
        auction.startPrice = startPrice*10**18;
        auction.maxPrice = maxPrice*10**18;
        auction.isValid = true;

        auctions.push(auction);
    } 

    function joinAuction(uint collectionId) public payable {
        // uction storage auction = collectionAuctions[collectionId];
        require(collectionAuctions[collectionId].isValid, "This collection is not on an auction");
        require(msg.value >= collectionAuctions[collectionId].startPrice && msg.value <= collectionAuctions[collectionId].maxPrice, "Invalid value");

        collectionAuctions[collectionId].bids.push(Bid(msg.sender, msg.value));
    }

    function finishAuction(uint collectionId) public {
        Auction storage auction = collectionAuctions[collectionId];
        require(auction.isValid, "This collection is not on an auction");

        address newOwner;
        uint winPrice = 0;

        // Select winner
        for (uint index = 0; index < auction.bids.length; index++) {
            if (auction.bids[index].amount > winPrice) {
                winPrice = auction.bids[index].amount;
                newOwner = auction.bids[index].bidder;
            }
        }

        // Transfer money back
        for (uint index = 0; index < auction.bids.length; index++) {
            if (auction.bids[index].bidder != newOwner) {
                payable(auction.bids[index].bidder).transfer(auction.bids[index].amount);
            }
        }

        payable(owner).transfer(winPrice);

        Collection storage collection = collections[collectionId];
        collection.isOpen = true;
        
        for (uint nftIdx = 0; nftIdx < collection.nftIds.length; nftIdx++) {
            uint nftId = collection.nftIds[nftIdx];
            safeTransferFrom(nfts[nftId].owner, newOwner, nftId, 1, "");
            nfts[nftId].owner = newOwner;
        }
    } 
}
