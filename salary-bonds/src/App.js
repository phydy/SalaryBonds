import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Dashboard } from './pages/dashboard/dashboard';
//import { Market } from './pages/market/market';
//import { Link } from "react-router-dom";
//import logo from "./logo.svg";
//import { ShoppingCart } from "phosphor-react";
import { Home } from './pages/home/home';
import "./components/navbar.css";
import {useState, React  } from "react";
import Web3 from "web3";

import { Bond } from './pages/dashboard/bond';
import { BondRequest } from './pages/dashboard/bondReq';
//import { NavBar } from './components/navbar';
import { Navbar, Button , Nav, Container, ThemeProvider} from "react-bootstrap";




let bondContract
let marketContract
let tokenContract
function App() {

  //const [web3Props, setWeb3props] = useState({web3: null, accounts: null, contract: null});
//
  //const OnsighIn = function(param) {
  //  let {web3, accounts, contract} = param;
//
  //  if(web3 && accounts && accounts.length && contract) {
  //    setWeb3props({web3, accounts, contract})
  //  }
  //}

  //const contractAvailable = !(!web3Props.web3 && !web3Props.accounts && !web3Props.contract);
//
//
  //const walletAddress1 = web3Props.accounts ? web3Props.accounts[0] : "";

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");

  const[tokenBalance, setTokenbalance] = useState("");
  //const [provider, setProvider] = useState(null);
  const [bondContractAddress, setBondAddresses] = useState("");
  const [bContract, setBondContract] = useState({});
  const [BONDS, setBonds] = useState([
    {
      token: "",
      seller: "",
      buyer: "",
      amountRequired: 0,
      duration: 0,
      startTime: 0,
      endTime: 0,
      position: 0
  }
  ]);
  const [BOND_REQUESTS, setRequests] = useState([
    {token: "", requestor:"", taker: "", AmountGiven: 0, amountRequired: 0, duration: 0, position: 0}
  ]);
  const connectWallet = async() => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
          try {
            const web3 = new Web3(window.ethereum);

            const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            setWalletAddress(accounts[0]);
            const balance = await web3.eth.getBalance(accounts[0]);
            setBalance(balance)
            console.log(accounts[0]);
          } catch(err) {
              console.error(err.message);
          }
          try {
            const web3 = new Web3(window.ethereum);
      
            const chain = await web3.eth.getChainId();
      
            console.log(chain);
            const MarketArtifact = await import("./abis/BondMarket.json"); 
            const Bondcontract = await import("./abis/Bondcontract.json");
            const addrs = await import("./abis/map.json");
            
            const contractAddressObj = addrs["80001"];
      
            const bondmarketArray = contractAddressObj.SalaryBondContract;
      
            const marketArray = contractAddressObj.BondMarket;
      
            const marketAddress = marketArray.at(0);
            const contractAddress = bondmarketArray.at(0);
            setBondAddresses(contractAddress);
            console.log(contractAddress);
            console.log(marketAddress);
      
            bondContract = new web3.eth.Contract(
              Bondcontract.abi,
              contractAddress, {from: walletAddress}
            );
              
            setBondContract(bContract);
            marketContract = new web3.eth.Contract(MarketArtifact.abi, marketAddress, {from: walletAddress});
            
      
      
            let bonds = await bondContract.methods.getActiveBonds().call();
            console.log(bonds)
      
            let BONDS_BACK = [];
            for (let i = 0; i< bonds.length; i++) {
              let requests = bonds.at(i);
              let objbond = {
                token: requests[0],
                seller: requests[1],
                buyer: requests[2],
                amountRequired: requests[3],
                duration: requests[4],
                start_time: requests[5],
                end_time: requests[6],
                position: requests[7]
              };
              BONDS_BACK.push(objbond);
            }
            setBonds(BONDS_BACK);
            console.log(BONDS_BACK);
      
            let bondreq = await bondContract.methods.getActiveBondrequests().call();
            console.log(bondreq);
            let REAQS = [];
            for (let i = 0; i< bondreq.length; i++) {
              let requests = bondreq.at(i);
              let objReq = {
                token: requests[0],
                requestor: requests[1],
                taker: requests[2],
                amountGiven: requests[3],
                amountRequired: requests[4],
                duration: requests[5],
                position: requests[6]
              };
              REAQS.push(objReq);
            }
      
            setRequests(REAQS);
            console.log(REAQS.length)
            console.log(REAQS);
          }
          catch(err) {
            console.error();
          }
      } else {
          console.log("Metamask Not found");
      }
  }


  const NavBa = () => {

    
    return (
    <ThemeProvider breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']} minBreakpoint="xxs">
      <div className="navbar">

        <Navbar bg="dark" variant="dark" expand={'lg'} >
            <Container>
                <Navbar.Brand href="/">Income Bonds</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link href="/market">Market</Nav.Link>
                    </Nav>
                    <Nav>
                        <Button className="" onClick={connectWallet}>
                            <Container>
                                <span>
                                    {walletAddress.length > 0 ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "Connect Wallet"} 
                                </span>
                            </Container>
                        </Button>
                    </Nav>
            </Container>
        </Navbar>
        {
		//<div className="navLeft">
		//	<div className="navlogo">
		//		<img src={logo}></img>
		//		SB
		//	</div>
		//</div>
    //    <div className="navRight">
    //    <Link to="/home">Home</Link>
    //    <Link to= "/">Dashboard</Link>
    //    <Link to= "/market"> 
    //        <ShoppingCart  size={32}></ShoppingCart>
    //    </Link> 
    //        <button className="wallet" onClick={connectWallet}>
    //          <span>
    //            {walletAddress.length > 0 ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "Connect Wallet"} 
    //          </span>
    //        </button>
    //      </div>
    }

     </div>
     </ThemeProvider>
    )
  }


 const Dash = () => {

    return (
      <div>
        <div className="dashboard">
          <div>
            <div className="dashTitle">
            </div>
              <div className="bonds">
                  {""}
                  {
                      BONDS.map((bond) => (
                          <Bond data={bond} />
                      ))
                  }
              </div>
          </div>

        </div>
        </div>
    )
}



 
const Market = () => {
  return (
    <section>
      <div className="dashboard">
        
        <Container>
        <div>
          <div className="bonds">
              {""}
              {
                  BOND_REQUESTS.map((bond) => (
                      <BondRequest data={[bond, bContract, walletAddress, marketContract]}/>
                  ))
              }
          </div>
          </div>
          </Container>
      </div>
    </section>

  )
}

  return (
    <div className="dashboard">
      <Router>
        <NavBa></NavBa>
        <Routes>
          <Route path="/" element = { <Home />}/>
          <Route path='/dashboard' element = {<Dash />} />
          <Route path="/market" element = { <Market />} />
          <Route path='/home' element= {<Dashboard bondContract={bondContract} bonds={BONDS} bondReqs={BOND_REQUESTS}/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
