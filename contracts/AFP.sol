//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.5;

import "hardhat/console.sol";
import "./AccessControlAFP.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AFP is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControlAFP, ERC721Burnable {
    using Counters for Counters.Counter;

    enum FoodType {
        FRUITS,
        VEGETABLES,
        MEAT
    }

    enum FoodMetric {
        KILO,
        GRAM,
        LITTER
    }

    //  FoodType foodType;
    //  FoodMetric foodmetric;

    // struct foodAsset {
    //     bool active;
    //     string name;
    //     uint256 quantity;
    //     string description;
    //     uint256 creationDate;
    // }

    struct foodAsset {
        string name;
        uint256 quantity;
    }

    mapping(uint256 => foodAsset) private _food;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant WAREHOUSE_ROLE = keccak256("WAREHOUSE_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Alector FoodPrint", "AFP") {
        // _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE); // is this necessary??
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // this is a public variable defined in the AccessControl contract
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(PRODUCER_ROLE, msg.sender);
    }

    function Produce(string memory name, uint256 quantity) public onlyRole(PRODUCER_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 currentId = _tokenIdCounter.current();
        _mint(msg.sender, currentId);
        _food[currentId] = foodAsset(name, quantity);
        return currentId;
    }

    // _food connects the nft ID with a food asset
    function getFoodAssetById(uint256 id) public view returns (foodAsset memory) {
        return _food[id];
    }

    function transferFromProducer(
        address from,
        address to,
        uint256 tokenId
    ) public onlyRole(PRODUCER_ROLE) {
        // do other stuff here
        transferFrom(from, to, tokenId);
    }

    function addAdmin(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(ADMIN_ROLE, to);
    }

    function printAdminRole() public pure returns (bytes32) {
        return ADMIN_ROLE;
    }

    function addProducer(address to) public onlyRole(PRODUCER_ROLE) {
        _setupRole(PRODUCER_ROLE, to);
    }

    function addWarehouse(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(WAREHOUSE_ROLE, to);
    }

    function addVendor(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(VENDOR_ROLE, to);
    }

    // function safeMint(address to) public onlyRole(PRODUCER_ROLE) {
    //     _safeMint(to, _tokenIdCounter.current());
    //     _tokenIdCounter.increment();
    // }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "http://www.google.com";
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControlAFP)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
