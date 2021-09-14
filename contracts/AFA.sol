//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.5;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Alector Food Asset
 * @author @alector
 * @dev AFA (Alector Food Asset)  represents a smart contract (NFT - ERC721) that registers and transfers food assets, thus providing transparency & traceability in the food chain
 */
contract AFA is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControl, ERC721Burnable {
    using Counters for Counters.Counter;

    struct foodAsset {
        address producedBy;
        uint256 quantity;
        uint256 foodType;
        uint256 foodSubtype;
    }

    mapping(uint256 => foodAsset) private _food;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant WAREHOUSE_ROLE = keccak256("WAREHOUSE_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    Counters.Counter private _tokenIdCounter;

    /**
     * @dev Initializes the contract by setting up all the roles shared with `DEFAULT_ADMIN_ROLE`.
     */
    constructor() ERC721("Alector Food Asset", "AFA") {
        // _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE); // is this necessary??
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // this is a public variable defined in the AccessControl contract
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(PRODUCER_ROLE, msg.sender);
    }

    /**
     * @dev This function produces new NFT tokens that correspond to new food assets.
     * The access is restricted to users registered with `PRODUCER_ROLE`
     *  @param quantity the quantity of new food asset, e.g. 10, 100 or 1000
     *  @param foodType the food type of new food asset, e.g. the number 0 may correspont to Tomatoes, 1 to Potatoes etc.
     *  @param foodSubtype the food sybtype e.g. the number 0 may correspond to standard, 1 to biological etc.
     *  @notice the unit is not included parameter (e.g. Kilos or Lt or Items), it is calculated in the front-end based on foodtype.
     */
    function Produce(
        uint256 quantity,
        uint256 foodType,
        uint256 foodSubtype
    ) public onlyRole(PRODUCER_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 currentId = _tokenIdCounter.current();
        _mint(msg.sender, currentId);
        _food[currentId] = foodAsset(msg.sender, quantity, foodType, foodSubtype);
        return currentId;
    }

    /**
     * @dev This is similar to `Produce` function but it is produced on behalf of another account `producedBy`. The created new NFT is subsequently transfered to this account.
     * It is useful to create products on behalf of producers with a post-deploy scroipt
     * The access is restricted to users registered with `PRODUCER_ROLE`
     *  @param quantity the quantity of new food asset, e.g. 10, 100 or 1000
     *  @param foodType the food type of new food asset, e.g. the number 0 may correspont to Tomatoes, 1 to Potatoes etc.
     *  @param foodSubtype the food sybtype e.g. 0 may correspond to standard, 1 to biological etc.
     *  @param producedBy the account where this food asset will be transfered to, and also registered as producer in the food asset
     *  @notice the unit is not included parameter (e.g. Kilos or Lt or Items), it is calculated in the front-end based on foodtype.

     */
    function AdminProduce(
        uint256 quantity,
        uint256 foodType,
        uint256 foodSubtype,
        address producedBy
    ) public onlyRole(PRODUCER_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 currentId = _tokenIdCounter.current();
        _mint(msg.sender, currentId);
        _food[currentId] = foodAsset(producedBy, quantity, foodType, foodSubtype);
        transferFrom(msg.sender, producedBy, currentId);
        return currentId;
    }

    /**
     * @dev get the NFT based on the provided unique ID.
     * @param id the unique id of the NFT token
     * @return the retreived NFT
     */
    function getFoodAssetById(uint256 id) public view returns (foodAsset memory) {
        return _food[id];
    }

    /**
     * @dev the function transfers NFT but it is reserved for producers
     * @param from the owner of the NFT
     * @param to the receiver of the transfer
     * @param tokenId the id of the token transfered
     * @notice this function is not useful at this point, but can be adapted to give privileged & incentives for producers to use this smart contract to transfer their food assets.
     */
    function transferFromProducer(
        address from,
        address to,
        uint256 tokenId
    ) public onlyRole(PRODUCER_ROLE) {
        // do other stuff here
        transferFrom(from, to, tokenId);
    }

    /**
     * @dev print the `ADMIN_ROLE`, for experimental reasons.
     */
    function printAdminRole() public pure returns (bytes32) {
        return ADMIN_ROLE;
    }

    /**
     * @dev add addministrator role
     * @param to the acount that will receive administrator role
     */
    function addAdmin(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(ADMIN_ROLE, to);
    }

    /**
     * @dev add producer role
     * @param to the acount that will receive producer role
     */
    function addProducer(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(PRODUCER_ROLE, to);
    }

    /**
     * @dev add warehouse role
     * @param to the acount that will receive warehouse role
     */
    function addWarehouse(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(WAREHOUSE_ROLE, to);
    }

    /**
     * @dev add vendor role
     * @param to the acount that will receive vendor role
     */
    function addVendor(address to) public onlyRole(ADMIN_ROLE) {
        _setupRole(VENDOR_ROLE, to);
    }

    /**
     * @dev pause the smart contract, restricted to users registered with `PAUSER_ROLE`
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev unpause the smart contract, restricted to users registered with `PAUSER_ROLE`
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {ERC721-_burn}.
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
