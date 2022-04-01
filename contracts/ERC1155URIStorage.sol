//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC1155URIStorage {

  string private _baseURL;

  mapping(uint => string) private _tokenURIs;

  constructor(string memory _base) {
    _baseURL = _base;
  }

  function baseURL() public view returns (string memory) {
    return _baseURL;
  }

  function _getTokenURI(uint _tokenId) view internal returns (string memory) {
    if(bytes(_tokenURIs[_tokenId]).length == 0){return _baseURL;}
    return string(abi.encodePacked(_baseURL, _tokenURIs[_tokenId]));
  }

  function _setTokenURI(uint _tokenId, string memory _tokenURI) internal {
    _tokenURIs[_tokenId] = _tokenURI;
  }

}
