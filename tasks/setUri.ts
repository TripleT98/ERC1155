import {contract, web3, task, envParams, getSign} from "./tasks";


type taskArgs = {
  tokenId: string;
  uri:string;
  gaslimit: string;
  privatekey: string;
}

export default function setUriTask() {
  task("mint", "mint some erc1155 tokens")
  .addParam("uri", "Tokend uri")
  .addParam("tokenId", "Token id")
  .addParam("gaslimit", "The limit of gas")
  .addParam("privatekey", "Your private key")
  .setAction(async(tArgs:taskArgs)=>{
    let {uri, tokenId, gaslimit, privatekey} = tArgs;
    let data = await contract.methods.setTokenURI(tokenid, uri).encodeABI();
    let sign = await getSign({gaslimit, privatekey, data});
    let transaciton = await web3.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(transaciton.transactionHash);
  })
}
