import {contract, web3, task, envParams, getSign} from "./tasks";


type taskArgs = {
  amount: string;
  tokenid: string;
  address: string;
  gaslimit: string;
  privatekey: string;
}

export default function mintTask() {
  task("mint", "mint some erc1155 tokens")
  .addParam("amount", "amount of tokens")
  .addParam("tokenid", "Token id")
  .addParam("address", "Minted to address")
  .addParam("gaslimit", "The limit of gas")
  .addParam("privatekey", "Your private key")
  .setAction(async(tArgs:taskArgs)=>{
    let {amount, tokenid, address, gaslimit, privatekey} = tArgs;
    let data = await contract.methods.mint(address, tokenid, amount).encodeABI();
    let sign = await getSign({gaslimit, privatekey, data});
    let transaciton = await web3.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(transaciton.transactionHash);
  })
}
