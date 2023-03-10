import Web3 from "web3";
import {getEthereum} from "./getEthereum";

export const getWeb3 = async () => {

    const ethereum = await getEthereum()
    let web3

    if (ethereum) {
        web3 = new Web3(ethereum)
    } else if (window.web3) {
        web3 = window.web3
    }

    return web3
} 