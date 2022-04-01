import {contract, web3, task, envParams, getSign} from "./tasks";

type taskArgs = {
  tokenid: string;
}

export default function getUrlTask() {
  task("geturl", "mint some erc1155 tokens")
  .addParam("tokenid", "Token id")
  .setAction(async(tArgs:taskArgs)=>{
    let {tokenid} = tArgs;
    try{
    let data = await contract.methods.getTokenURI(tokenid).call();
    console.log(data);
  }catch(e:any){
    console.log(e.message);
  }
  })
}
