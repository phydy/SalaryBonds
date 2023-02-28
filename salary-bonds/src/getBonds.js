
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Dashboard } from './pages/dashboard/dashboard';
import { Market } from './pages/market/market';
import { ethers } from 'ethers';
import { Link } from "react-router-dom";
import logo from "./logo.svg";
import { ShoppingCart } from "phosphor-react";
import "./components/navbar.css";
import { useEffect, useState, React  } from "react";

const MarketArtifact = await import("./abis/BondMarket.json"); 
const Bondcontract = await import("./abis/Bondcontract.json");

const addresses = await import("./abis/map.json");




function App() {
  const [walletAddress, setWalletAddress] = useState("");
  //const [provider, setProvider] = useState(null);
  //const [bondContract, setBondContract] = useState(null);
  //const [BONDS, setBonds] = useState([]);


  const connectWallet = async() => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
          try {
            	const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            	setWalletAddress(accounts[0]);
            	console.log(accounts[0]);
				const provider = await window.web3;
				//setProvider(providers);
				const signers = await provider.eth.getAccounts();
				const chainId = parseInt(await provider.eth.getChainId()); 
				//const contractB = new ethers.Contract(
				//	addresses[80001].SalaryBondContract.at(0),
				//	Bondcontract.abi,
				//	provider
				//);
				//setBondContract(contractB);
//
				//const bondArray = await contractB.getActiveBonds();
				//setBonds(bondArray);
//
				//console.log(bondArray);
			  this.state({
				//provider,
				signers,
				chainId
				//MarketArtifact,
				//Bondcontract
			  })
          } catch(err) {
              console.error(err.message);
          }
      } else {
          console.log("Metamask Not found");
      }
  }


  const NavBar = () => {
    return (
      <div className="navbar">
		<div className="navLeft">
			<div className="navlogo">
				<img src={logo}></img>
				SB
			</div>
		</div>
        <div className="navRight">
              <Link to= "/">Dashboard</Link>
              <Link to= "/market"> 
                  <ShoppingCart  size={32}></ShoppingCart>
              </Link> 
              <Link to="/wallet">
                  <button className="wallet" onClick={connectWallet}>
                      <span>
                        {walletAddress.length > 0 ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "Connect Wallet"} 
                      </span>
                  </button>
              </Link>
          </div>
      </div>)
  }

  return (
    <div className="App">
      <Router>
        <NavBar></NavBar>
        <Routes>
          <Route path="/" element = { <Dashboard />}/>
          <Route path="/market" element = { <Market />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
