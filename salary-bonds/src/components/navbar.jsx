import { Link } from "react-router-dom";

import { ShoppingCart } from "phosphor-react";
import "./navbar.css";
import { useEffect, useState, React  } from "react";

import { Navbar, Button , Nav, Container} from "react-bootstrap";

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
        <Navbar bg="dark" variant="dark" expand={'lg'} >
            <Container>
                <Navbar.Brand href="#home">Income Bonds</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#features">Dashboard</Nav.Link>
                        <Nav.Link href="#pricing">Market</Nav.Link>
                    </Nav>
                    <Nav>
                        <Button className="" onClick={connectWallet}>
                            <Container>
                                Connect Wallet
                            </Container>
                        </Button>
                    </Nav>
            </Container>
        </Navbar>
    {
//                <div className="links">
//            
//                <Link to= "/">Dashboard</Link>
//                <Link to= "/market">
//                    <ShoppingCart size={32}></ShoppingCart>
//                </Link>
//    
//                <Link to="/wallet">
//    
//                </Link>
//                <button className="wallet" onClick={connectWallet}>
//                        <span>
//                            Connect Wallet
//                        </span>
//                </button>
//            </div>
//    
    }        
    </div>)
}