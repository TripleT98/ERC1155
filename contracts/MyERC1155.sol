//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyAccessControll.sol";
import "./ERC1155URIStorage.sol";

contract MyERC1155 is MyAccessControll, ERC1155URIStorage {

  string private name;
  string private symbol;
  uint private _totalSuply;

  constructor(string memory _name, string memory _symbol, bytes32 _adminRole, address _admin, string memory _baseURL) MyAccessControll(_adminRole, _admin) ERC1155URIStorage(_baseURL){
    name = _name;
    symbol = _symbol;
    bytes32 minter = keccak256("minter");
    bytes32 burner = keccak256("burner");
    createNewRole(minter, _adminRole);
    grandRole(minter, msg.sender);
    grandRole(minter, _admin);
    createNewRole(burner, _adminRole);
    grandRole(burner, msg.sender);
    grandRole(burner, _admin);
  }

    mapping (uint => uint) amounts;
    mapping (uint => mapping(address => uint)) private _balances;
    mapping (address => mapping(address => bool)) private _operatorAprovals;

    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint[] tokenIds, uint[] amount);

    event Transfer(address indexed operator, address indexed from, address indexed to, uint tokenId, uint amount);

    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    event URI(string value, uint indexed id);

    modifier OnlyMinter(address _sender){
      require(checkRole(keccak256("minter"), _sender), "Error: You have no access to mint tokens!");
      _;
    }

    modifier OnlyBurner(address _sender){
      require(checkRole(keccak256("burner"), _sender), "Error: You have no access to burn tokens!");
      _;
    }

    function getName() view public returns(string memory){
      return name;
    }

    function getSymbol() view public returns(string memory){
      return symbol;
    }

    function totalSuply() view public returns(uint){
      return _totalSuply;
    }

    function getAmountById(uint _tokenId) public view returns(uint) {
      return amounts[_tokenId];
    }

    function balanceOf(address _to, uint _tokenId) view public returns (uint) {
      require(address(0) != _to, "Error: query to zero address!");
      return _balances[_tokenId][_to];
    }

    function balanceOfBatch(address[] memory _accounts, uint[] memory _tokenIds) view public returns (uint[] memory) {
      require(_accounts.length == _tokenIds.length, "Error: Accounts array length don't equals to ids array length!");
      uint[] memory _balanceOfBatch = new uint256[](_accounts.length);
      for(uint i = 0; i < _accounts.length; i++){
        _balanceOfBatch[i] = balanceOf(_accounts[i], _tokenIds[i]);
      }
      return _balanceOfBatch;
    }

    function setApprovalForAll(address _operator, bool _approved) public {
      _setApprovalForAll(msg.sender, _operator, _approved);
    }

    function _setApprovalForAll(address _owner, address _operator, bool _approved) internal {
      require(_operator != _owner, "Error: You can't set approval to yourself!");
      _operatorAprovals[_owner][_operator] = _approved;
      emit ApprovalForAll(_owner, _operator, _approved);
    }

    function isApprovalForAll(address _from, address _to) view public returns (bool) {
      return _operatorAprovals[_from][_to];
    }

    function safeTransferFrom (address _from ,address _to, uint _tokenId, uint _amount) public {
      require(_to != address(0), "Error: TransferFrom query to zero address!");
      require(_from == msg.sender || isApprovalForAll(_from, msg.sender), "Error: transfer caller is not owner or not approved!");
      _safeTransferFrom(_from, _to, _tokenId, _amount);
    }

    function _safeTransferFrom(address _from, address _to, uint _tokenId, uint _amount) internal {
      uint beforeBalanse = balanceOf(_from, _tokenId);
      require(beforeBalanse >= _amount, "Error: cannot transfer more tokens than owner has!");
      _balances[_tokenId][_from] -= _amount;
      _balances[_tokenId][_to] += _amount;
      emit Transfer(msg.sender, _from, _to, _tokenId, _amount);
    }

    function safeBatchTransferFrom(address _from, address _to, uint[] memory _tokenIds, uint[] memory _amount) public {
      require(_to != address(0), "Error: BatchTransfer to zero address");
      require(_from == msg.sender || isApprovalForAll(_from, msg.sender), "Error: You have no allowance to transfer this tokens!");
      _safeBatchTransferFrom(_from, _to, _tokenIds, _amount);
    }

    function _safeBatchTransferFrom(address _from, address _to, uint[] memory _tokenIds, uint[] memory _amount)
    internal {
    require(_tokenIds.length == _amount.length, "Error: Ids array length not equals amount length!");

      for(uint i = 0; i < _amount.length; i++) {
        require(balanceOf(_from, _tokenIds[i]) >= _amount[i], "Error: not enough tokens to transferFrom");

        _balances[_tokenIds[i]][_from] -= _amount[i];
        _balances[_tokenIds[i]][_to] += _amount[i];
      }

      emit TransferBatch(msg.sender, _from, _to, _tokenIds, _amount);

    }

    function setTokenURI(uint _tokenId, string memory _uri) public OnlyMinter(msg.sender){
      require(amounts[_tokenId] != 0, "Error: This token doesn't exist!");
      _setTokenURI(_tokenId, _uri);
      emit URI(_uri, _tokenId);
    }

    function getTokenURI(uint _tokenId) view public returns (string memory) {
      require(amounts[_tokenId] != 0, "Error: This token doesn't exist!");
      bytes memory tokenUri = abi.encodePacked(_getTokenURI(_tokenId));
      bytes memory baseUrl = abi.encodePacked(baseURL());
      require((tokenUri.length != baseUrl.length), "This token hasn't URI yet!");
      return _getTokenURI(_tokenId);
    }

    function mint(address _to, uint _tokenId, uint _amount) public OnlyMinter(msg.sender) {
      require(address(0) != _to, "Error: mint to zero address!");
      _mint(_to, _tokenId, _amount);
    }

    function _mint(address _to, uint _tokenId, uint _amount) internal {
      _balances[_tokenId][_to] += _amount;
      amounts[_tokenId] += _amount;
      _totalSuply += _amount;
      emit Transfer(msg.sender, address(0), _to, _tokenId, _amount);
    }

    function burn(address _from, uint _tokenId, uint _amount) public OnlyBurner(msg.sender) {
      require(address(0) != _from, "Error: burn from zero address!");
      require(balanceOf(_from, _tokenId) >= _amount, "Error: There are no such a big amount of this tokens on this account to burn them!");
      _burn(_from, _tokenId, _amount);
    }

    function _burn(address _from, uint _tokenId, uint _amount) internal {
      _balances[_tokenId][_from] -= _amount;
      amounts[_tokenId] -= _amount;
      _totalSuply -= _amount;
      emit Transfer(msg.sender, _from, address(0), _tokenId, _amount);
    }

    function mintBatch(address _to, uint[] memory _tokenIds, uint[] memory _amount) public OnlyMinter(msg.sender) {
      _mintBatch(_to, _tokenIds, _amount);
    }

    function _mintBatch(address _to, uint[] memory _tokenIds, uint[] memory _amount) public {
      require(_to != address(0), "Error: Mint batch to zero address");
      require(_tokenIds.length == _amount.length, "Error: Ids not equal amount length!");

      for(uint i = 0; i < _tokenIds.length; i++){
      _balances[_tokenIds[i]][_to] += _amount[i];
      amounts[_tokenIds[i]] += _amount[i];
      _totalSuply += _amount[i];
      }

      emit TransferBatch(msg.sender, address(0), _to, _tokenIds, _amount);

    }

    function burnBatch(address _from, uint[] memory _tokenIds, uint[] memory _amount) public OnlyMinter(msg.sender) {
      _burnBatch(_from, _tokenIds, _amount);
    }

    function _burnBatch(address _from, uint[] memory _tokenIds, uint[] memory _amount) public {
      require(_from != address(0), "Error: Burn batch from zero address");
      require(_tokenIds.length == _amount.length, "Error: Ids not equal amount length!");

      for(uint i = 0; i < _tokenIds.length; i++){
        require(balanceOf(_from, _tokenIds[i]) >= _amount[i], "Error: Burn amount is bigger than u have!");
        _balances[_tokenIds[i]][_from] -= _amount[i];
        amounts[_tokenIds[i]] -= _amount[i];
        _totalSuply -= _amount[i];
      }

      emit TransferBatch(msg.sender, _from, address(0), _tokenIds, _amount);

    }

}
