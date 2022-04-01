// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MyAccessControll{

    bytes32 mainAdmin;

    struct RoleData{
        mapping (address => bool) members;
        bytes32 adminRole;
    }

    mapping (bytes32 => RoleData) _roles;

    modifier onlyAdmin(bytes32 _role, address _admin){
        require(isAdmin(_role,_admin), "Error: You have no access to this function!");
        _;
    }

    event RoleCreated(bytes32 _role, bytes32 _adminRole);
    event RoleGranded(bytes32 indexed _role, address indexed _account, address _sender);
    event RoleRevoked(bytes32 indexed _role, address indexed _account, address _sender);
    event AdminRoleChanged(bytes32 indexed _prevAdminRole, bytes32 indexed _newAdminRole, bytes32 _role);

    constructor (bytes32 _adminRole, address _admin) {
        RoleData storage _roleData = _roles[_adminRole];
        _roleData.members[_admin] = true;
        _roleData.members[msg.sender] = true;
        _roleData.adminRole = _adminRole;
        mainAdmin = _adminRole;
        emit RoleCreated(_adminRole, _adminRole);
        emit RoleGranded(_adminRole, _admin, msg.sender);
        emit RoleGranded(_adminRole, msg.sender, msg.sender);
    }

    function _grandRole(bytes32 _role, address _account) internal {
        _roles[_role].members[_account] = true;
        emit RoleGranded(_role, _account, msg.sender);
    }

    function _removeRoleFrom(bytes32 _role, address _account) internal {
       _roles[_role].members[_account] = false;
       emit RoleRevoked(_role, _account, msg.sender);
    }

    function checkRole(bytes32 _role, address _account) public view returns(bool){
        return _roles[_role].members[_account];
    }

    function isAdmin(bytes32 _role, address _account) public view returns(bool){
        if(_roles[mainAdmin].members[_account]){return true;}
        RoleData storage adminRole = _roles[_roles[_role].adminRole];
        return adminRole.members[_account];
    }

    function changeAdminRole(bytes32 _role, bytes32 _newAdminRole) public onlyAdmin(_role,msg.sender) {
        bytes32 _prevAdminRole = _roles[_role].adminRole;
        _roles[_role].adminRole = _newAdminRole;
        emit AdminRoleChanged(_prevAdminRole, _newAdminRole, _role);
    }

    function grandRole(bytes32 _role, address _account) public onlyAdmin(_role, msg.sender) {
        if(!checkRole(_role, _account)){
            _grandRole(_role, _account);
        }
    }

    function revokeRole(bytes32 _role, address _account) public onlyAdmin(_role, msg.sender) {
        if(checkRole(_role, _account)){
           _removeRoleFrom(_role, _account);
        }
    }

    function createNewRole(bytes32 _role, bytes32 _adminRole) public onlyAdmin(_role, msg.sender) {
        _createNewRole(_role, _adminRole);
        emit RoleCreated(_role, _adminRole);
    }

    function _createNewRole(bytes32 _role, bytes32 _adminRole) internal {
        RoleData storage roleData = _roles[_role];
        roleData.adminRole = _adminRole;
    }
}
