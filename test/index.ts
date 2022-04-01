import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Signer, Contract, ContractFactory, BigNumber } from "ethers";
import web3 from "web3";

describe("MyERC1155", function () {
  let MyERC1155: ContractFactory, myERC1155: Contract, owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress;
let zeroAddress: string = "0x0000000000000000000000000000000000000000";
//general roles
let minter: string = web3.utils.keccak256("minter");
let burner: string = web3.utils.keccak256("burner");
let mainAdmin: string = web3.utils.keccak256("admin");
let baseURL: string ="https://ipfs.io/ipfs/";
beforeEach(async()=>{

  [owner, user1, user2, user3] = await ethers.getSigners();

  MyERC1155 = await ethers.getContractFactory("MyERC1155");
  myERC1155 = await MyERC1155.connect(owner).deploy("MyERC1155", "MRCNF", mainAdmin, user1.address, baseURL);
  await myERC1155.deployed();
})

  it("Is contract", async()=>{
    console.log(await myERC1155.isContract());
  })

  it("Testing getName getter", async()=>{
    expect(await myERC1155.getName()).to.equal("MyERC1155");
  })

  it("Testing getSymbol getter", async()=>{
    expect(await myERC1155.getSymbol()).to.equal("MRCNF");
  })

  it("Testing mint and balanceOf functions", async()=>{

      await myERC1155.connect(owner).mint(user1.address, 1, 3);
      await myERC1155.connect(owner).mint(user2.address, 3, 2);
      await myERC1155.connect(owner).mint(user3.address, 6, 10);
      let u1Balance:BigNumber = await myERC1155.balanceOf(user1.address, 1);
      let u2Balance:BigNumber = await myERC1155.balanceOf(user2.address, 3);
      let u3Balance:BigNumber = await myERC1155.balanceOf(user3.address, 6);
      expect([String(u1Balance),String(u2Balance),String(u3Balance)]).to.deep.equal(["3","2","10"]);

    })

  it("Teseting totalSuply, getAmount functions", async()=>{
    await myERC1155.connect(owner).mint(user1.address, 1, 3);
    await myERC1155.connect(owner).mint(user2.address, 3, 2);
    await myERC1155.connect(owner).mint(user3.address, 6, 10);
    expect(await myERC1155.totalSuply()).to.equal("15");
    expect(await myERC1155.getAmountById("1")).to.equal("3");
    expect(await myERC1155.getAmountById("3")).to.equal("2");
    expect(await myERC1155.getAmountById("6")).to.equal("10");
  })

  it("Testing burn function", async()=>{
      await myERC1155.connect(owner).mint(user1.address, 1, 3);
      let u1Balance:BigNumber = await myERC1155.balanceOf(user1.address, 1);
      expect(String(u1Balance)).to.equal("3");
      await myERC1155.connect(owner).burn(user1.address, 1, 2);
      u1Balance = await myERC1155.balanceOf(user1.address, 1);
      expect(String(u1Balance)).to.equal("1");
  })

  it("Testing mintBatch function", async()=>{
    let user1toToken1balance: string = String(await myERC1155.balanceOf(user1.address, 1));
    let user1toToken2balance: string = String(await myERC1155.balanceOf(user1.address, 2));
    let user1toToken3balance: string = String(await myERC1155.balanceOf(user1.address, 3));
    expect([user1toToken1balance,user1toToken2balance,user1toToken3balance]).to.deep.equal(["0","0","0"]);
    await myERC1155.connect(owner).mintBatch(user1.address, [1,2,3], [3,4,5]);
    user1toToken1balance = String(await myERC1155.balanceOf(user1.address, 1));
    user1toToken2balance = String(await myERC1155.balanceOf(user1.address, 2));
    user1toToken3balance = String(await myERC1155.balanceOf(user1.address, 3));
    expect([user1toToken1balance,user1toToken2balance,user1toToken3balance]).to.deep.equal(["3","4","5"]);
  })

  it("Testing burnBatch function", async()=>{
    await myERC1155.connect(owner).mint(user1.address, 1, 3);
    await myERC1155.connect(owner).mint(user1.address, 2, 2);
    await myERC1155.connect(owner).mint(user1.address, 3, 1);
    let user1toToken1balance: string = String(await myERC1155.balanceOf(user1.address, 1));
    let user1toToken2balance: string = String(await myERC1155.balanceOf(user1.address, 2));
    let user1toToken3balance: string = String(await myERC1155.balanceOf(user1.address, 3));
    expect([user1toToken1balance,user1toToken2balance,user1toToken3balance]).to.deep.equal(["3","2","1"]);
    await myERC1155.connect(owner).burnBatch(user1.address, [1,2,3],[2,1,1]);
    user1toToken1balance = String(await myERC1155.balanceOf(user1.address, 1));
    user1toToken2balance = String(await myERC1155.balanceOf(user1.address, 2));
    user1toToken3balance = String(await myERC1155.balanceOf(user1.address, 3));
    expect([user1toToken1balance, user1toToken2balance, user1toToken3balance]).to.deep.equal(["1","1","0"]);
  })

  it("Testing approvalForAll and isApprovedForAll functions. Then call safeTransferFrom function from(user1) to(user3) msg.sender(user2). Then check the balances.", async()=>{
      await myERC1155.connect(owner).mint(user1.address, 1, 1);
      await myERC1155.connect(user1).setApprovalForAll(user2.address, true);
      expect(await myERC1155.isApprovalForAll(user1.address, user2.address)).to.equal(true);
      expect(String(await myERC1155.balanceOf(user1.address, 1))).to.equal("1");
      await myERC1155.connect(user1).safeTransferFrom(user1.address, user2.address, 1, 1);
      expect(String(await myERC1155.balanceOf(user1.address, 1))).to.equal("0");
      expect(String(await myERC1155.balanceOf(user2.address, 1))).to.equal("1");
    })

  it("Testing safeBatchTransferFrom", async()=>{
    await myERC1155.connect(owner).mint(user1.address, 1, 1);
    await myERC1155.connect(owner).mint(user1.address, 2, 3);
    await myERC1155.connect(owner).mint(user1.address, 4, 5);
    await myERC1155.connect(owner).mint(user1.address, 3, 6);
    await myERC1155.connect(owner).mint(user1.address, 9, 10);
    await myERC1155.connect(user1).setApprovalForAll(user2.address, true);
    await myERC1155.connect(user1).setApprovalForAll(user3.address, true);
    await myERC1155.connect(user2).safeBatchTransferFrom(user1.address, user2.address, [1,2,4,3,9], [1,2,3,3,8]);
    await myERC1155.connect(user1).safeBatchTransferFrom(user1.address, user3.address, [0], [0]);
    expect(await myERC1155.balanceOf(user2.address, 1)).to.deep.equal("1");
    expect(await myERC1155.balanceOf(user1.address, 1)).to.deep.equal("0");
    expect(await myERC1155.balanceOf(user2.address, 2)).to.deep.equal("2");
    expect(await myERC1155.balanceOf(user1.address, 2)).to.deep.equal("1");
  })

  it("Testing balanceOfBatch function", async()=>{

    await myERC1155.connect(owner).mint(user1.address, 1, 1);
    await myERC1155.connect(owner).mint(user2.address, 2, 3);
    await myERC1155.connect(owner).mint(user3.address, 4, 5);
    await myERC1155.connect(owner).mint(owner.address, 3, 6);
    let data = await myERC1155.balanceOfBatch([user1.address, user2.address,user3.address,owner.address], [1,2,4,3]);
    data = data.map((e: BigNumber,i:number)=>String(e));
    expect(data).to.deep.equal(["1", "3", "5", "6"]);

  })

  it("Testing safeTransferFrom funtion", async()=>{
    await myERC1155.connect(owner).mint(user1.address, 1, 1);
    await myERC1155.connect(owner).mint(user1.address, 2, 2);
    await myERC1155.connect(user1).safeTransferFrom(user1.address, user2.address, 1, 1);
    expect(await myERC1155.balanceOf(user2.address, 1)).to.equal("1");
    expect(await myERC1155.balanceOf(user1.address, 1)).to.equal("0");
    await myERC1155.connect(user1).setApprovalForAll(user2.address, true);
    await myERC1155.connect(user2).safeTransferFrom(user1.address, user2.address, 2, 1);
    expect(await myERC1155.balanceOf(user2.address, 2)).to.equal("1");
    expect(await myERC1155.balanceOf(user1.address, 2)).to.equal("1");
  })

describe("Testing reverts with error message", async()=>{

  it("Mint and burn from zero address", async()=>{
    let err_mess: string = "Error: mint to zero address!";
    await expect(myERC1155.connect(owner).mint(zeroAddress, 1, 1)).to.be.revertedWith(err_mess);
    err_mess = "Error: burn from zero address!";
    await expect(myERC1155.connect(owner).burn(zeroAddress, 1, 1)).to.be.revertedWith(err_mess);
  })

  it("MintBatch and burnBatch from zero address", async()=>{
    let err_mess: string = "Error: Mint batch to zero address";
    await expect(myERC1155.connect(owner).mintBatch(zeroAddress, [1,2,3], [3,2,1])).to.be.revertedWith(err_mess);
    err_mess = "Error: Burn batch from zero address";
    await expect(myERC1155.connect(owner).burnBatch(zeroAddress, [1,2,3], [3,2,1])).to.be.revertedWith(err_mess);
  })

  it("balanceOf from zero address", async()=>{
    let err_mess: string = "Error: query to zero address!";
    await expect(myERC1155.balanceOf(zeroAddress, 1)).to.be.revertedWith(err_mess);
  })

  it("Trying to burn more tokens than u have", async()=>{
    let err_mess: string = "Error: There are no such a big amount of this tokens on this account to burn them!";
    await expect(myERC1155.connect(owner).burn(user1.address, 1, 10)).to.be.revertedWith(err_mess);
  })

  it("Trying to burn batch via no matching amounts array length and token ids array length", async()=>{
    let err_mess: string = "Error: Ids not equal amount length!";
    await expect(myERC1155.connect(owner).burnBatch(user1.address, [1,2,3], [3,2,1,4])).to.be.revertedWith(err_mess);
  })

  it("Trying to burn bach more tokens than we have", async()=>{
    let err_mess: string = "Error: Burn amount is bigger than u have!";
    await expect(myERC1155.connect(owner).burnBatch(user1.address, [1,2,3], [3,2,1])).to.be.revertedWith(err_mess);
  })

  it("setApprovalForAll to yourself", async()=>{
    let err_mess: string = "Error: You can't set approval to yourself!";
    await expect(myERC1155.connect(owner).setApprovalForAll(owner.address, true)).to.be.revertedWith(err_mess);
  })

  it("SafeTransferFrom if transfer caller is not owner or not approved. TransferFrom to zero address!", async()=>{
    let err_mess: string = "Error: transfer caller is not owner or not approved!";
    await expect(myERC1155.connect(owner).safeTransferFrom(user1.address, user2.address, 1, 1)).to.be.revertedWith(err_mess);
    err_mess = "Error: TransferFrom query to zero address!";
    await expect(myERC1155.connect(owner).safeTransferFrom(owner.address, zeroAddress, 1, 1)).to.be.revertedWith(err_mess);
  })

  it("Transfer from more tokens than owner has", async()=>{
    await myERC1155.connect(owner).setApprovalForAll(user1.address, true);
    let err_mess: string = "Error: cannot transfer more tokens than owner has!";
    await expect(myERC1155.connect(owner).safeTransferFrom(owner.address, user2.address, 1, 1)).to.be.revertedWith(err_mess);
  })

  it("BatchTransferFrom without allowance", async()=>{
    let err_mess: string = "Error: You have no allowance to transfer this tokens!";
    await expect(myERC1155.connect(owner).safeBatchTransferFrom(user1.address, user2.address, [1,2,3], [1,1,4])).to.be.revertedWith(err_mess);
  })

  it("BatchTransferFrom with missmatch between ids length and amounts", async()=>{
    await myERC1155.connect(owner).setApprovalForAll(user1.address, true);
    let err_mess: string = "Error: Ids array length not equals amount length!";
    await expect(myERC1155.connect(user1).safeBatchTransferFrom(owner.address, user2.address, [1,2,3], [1,1,4,10,99])).to.be.revertedWith(err_mess);
  })

  it("BatchTransferFrom more tokens than owner has", async()=>{
    await myERC1155.connect(owner).setApprovalForAll(user1.address, true);
    let err_mess: string = "Error: not enough tokens to transferFrom";
    await expect(myERC1155.connect(owner).safeBatchTransferFrom(owner.address, user1.address, [1,2,3], [1,1,4])).to.be.revertedWith(err_mess);
  })

  it("BalanceOfBatch missmatch arrays lengths", async()=>{
    let err_mess: string = "Error: Accounts array length don't equals to ids array length!";
    await expect(myERC1155.balanceOfBatch([user1.address, user2.address], [1,2,3,4])).to.be.revertedWith(err_mess);
  })

  it("safeBatchTransferFrom to zero address", async()=>{
    let err_mess: string = "Error: BatchTransfer to zero address";
    await expect(myERC1155.connect(owner).safeBatchTransferFrom(owner.address, zeroAddress, [1,2,3], [1,1,4])).to.be.revertedWith(err_mess);
  })

})
describe("Testing MyAccessControll", async()=>{

    //"minter", "admin" and "buner"roles is already been declared in contract constructor. Owner and user1 are already members of "minter", "admin" and "burner". "admin" role declaed as adminRole for "minter" and "burner" roles.

    it("Testing check role function", async()=>{
      expect(await myERC1155.checkRole(minter, owner.address)).to.equal(true);
      expect(await myERC1155.checkRole(burner, owner.address)).to.equal(true);
    })

    it("Testing grandRole", async()=>{
      //if role to this user is not granded yet
      await myERC1155.connect(owner).grandRole(minter, user2.address);
      //Double grand to cover another "if" way
      await myERC1155.connect(owner).grandRole(minter, user2.address);
    })

    it("Testing isAdminFunction", async()=>{
      await myERC1155.connect(owner).grandRole(minter, user2.address);
      expect(await myERC1155.isAdmin(minter, owner.address)).to.equal(true);
      expect(await myERC1155.isAdmin(burner, owner.address)).to.equal(true);
      expect(await myERC1155.isAdmin(mainAdmin, owner.address)).to.equal(true);
    })

    it("Testing changeAdminRole function",async()=>{
      let err_mess: string = "Error: You have no access to this function!";
      let grandMinter: string = web3.utils.keccak256("grand_minter");
      await myERC1155.connect(owner).createNewRole(grandMinter, mainAdmin);
      await myERC1155.connect(owner).changeAdminRole(minter, grandMinter);
      await myERC1155.connect(owner).grandRole(grandMinter, user2.address);
      expect(await myERC1155.isAdmin(minter, user2.address)).to.equal(true);
      await expect(myERC1155.connect(user3).changeAdminRole(minter, grandMinter)).to.be.revertedWith(err_mess);

    })

    it("Testing revokeRole", async()=>{
      await myERC1155.connect(owner).grandRole(minter, user2.address);
      await myERC1155.connect(user2).mint(user3.address, 1, 1);
      await myERC1155.connect(owner).revokeRole(minter, user2.address);
      //Double revoke to cover another "if" way
      await myERC1155.connect(owner).revokeRole(minter, user2.address);
      let err_mess: string = "Error: You have no access to mint tokens!";
      await expect(myERC1155.connect(user2).mint(user3.address, 2, 1)).to.be.revertedWith(err_mess);

    })

  })

  describe("Testing URIStorage", async()=>{

    it("Testing baseURL function", async()=>{
      expect(await myERC1155.baseURL()).to.equal(baseURL);
    })

    it("Tseting setTokenURI and then getTokenURI functions", async()=>{
      //Trying to get token's URI while token doesn't exist
      let some_uri: string = "some_uri";
      let err_mess: string = "Error: This token doesn't exist!";
      await expect(myERC1155.getTokenURI("1")).to.be.revertedWith(err_mess);
      //Trying to set URI to not existing token
      await expect(myERC1155.setTokenURI("1", some_uri)).to.be.revertedWith(err_mess);
      //mint token "1"
      err_mess = "This token hasn't URI yet!";
      await myERC1155.connect(owner).mint(user1.address, 1, 4);
      await expect(myERC1155.getTokenURI("1")).to.be.revertedWith(err_mess);
      await myERC1155.setTokenURI("1", some_uri);
      expect(await myERC1155.getTokenURI("1")).to.equal(baseURL + some_uri);
    })

  })


})
