import { Link } from "react-router-dom";

import { ShoppingCart } from "phosphor-react";
import "./navbar.css";
import { useEffect, useState, React  } from "react";

//const [walletAddress, setWalletAddress] = useState("");
const connectWallet = async() => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        try {
            const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            //setWalletAddress(accounts[0]);
            console.log(accounts[0]);
        } catch(err) {
            console.error(err.message);
        }
    } else {
        console.log("Metamask Not found");
    }
}
export const NavBar = () => {
    return (
    <div className="navbar">
        <div className="links">
            <Link to= "/">Dashboard</Link>
            <Link to= "/market">
                <ShoppingCart size={32}></ShoppingCart>
            </Link>

            <Link to="/wallet">
                <button className="wallet" onClick={connectWallet}>
                    <span>
                        Connect Wallet
                    </span>
                </button>
            </Link>
        </div>
    </div>)
}