
import Web3 from "web3";


export const getProvider = async() => {
    return new Web3(window.ethereum)
}

export const getBondContract = async() => {
    const web3 = await getProvider();

    const Bondcontract = await import("../abis/Bondcontract.json");
    const addrs = await import("../abis/map.json");


    const contractAddressObj = addrs["80001"];
  
    const bondContractArray = contractAddressObj.SalaryBondContract;

    const contractAddress = bondContractArray.at(0);

    return new web3.eth.Contract(
        Bondcontract.abi,
        contractAddress
      );
}

export const getMarketcontract = async() => {
    const web3 = await getProvider();

    const MarketArtifact = await import("../abis/BondMarket.json"); 

    const addrs = await import("../abis/map.json");



    const contractAddressObj = addrs["80001"];
  
    const marketArray = contractAddressObj.BondMarket;

    const marketAddress = marketArray.at(0);

    return new web3.eth.Contract(
        MarketArtifact.abi,
        marketAddress
      );

} 

export const getActiveBonds = async() => {
    const bondContract = await getBondContract();

    let bonds = await bondContract.methods.getActiveBonds().call();

    let BONDS_BACK = [];
    for (let i = 0; i< bonds.length; i++) {
        let requests = bonds.at(i);
        let objbond = {
            token: requests[0],
            seller: requests[1],
            buyer: requests[3],
            amountRequired: requests[4],
            duration: requests[5],
            start_time: requests[6],
            end_time: requests[7],
            position: requests[8]
        };
        BONDS_BACK.push(objbond);
    }

    return BONDS_BACK
}

export const getActiveBondrequests = async() => {
    const bondContract = await getBondContract();

    let bondreq = await bondContract.methods.getActiveBondrequests().call();
    let REAQS = [];
    for (let i = 0; i< bondreq.length; i++) {
        let requests = bondreq.at(i);
        let objReq = {
            token: requests[0],
            requestor: requests[1],
            taker: requests[3],
            amountGiven: requests[4],
            amountRequired: requests[5],
            duration: requests[6],
            position: requests[7]
        };
        REAQS.push(objReq);
    }
}

export const getOpenBonds = async() => {

}