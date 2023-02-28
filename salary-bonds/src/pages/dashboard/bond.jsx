import React, { useState } from "react";
import { Card, Button, ListGroup, Container, Row, Col } from "react-bootstrap";
//import logo from "../../logo.svg";
import Web3 from "web3";


export const Bond = (props) => {
    const {token, seller, buyer, amountRequired, duration, startTime, endTime, position} = props.data;
    const DIVISOR = 1000000000000000000;
    
    const [wallet, setWalletAddress] = useState(0);
    const SECONDS_DAY = 86400;    const acceptBond = async () => {
        console.log(`Accepting bond Id: ${position}`);
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
              const web3 = new Web3(window.ethereum);
    
              const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
              setWalletAddress(accounts[0]);
              //const balance = await web3.eth.getBalance(accounts[0]);
              //setBalance(balance)
              console.log(accounts[0]);
            } catch(err) {
                console.error(err.message);
            }
            try {
              const web3 = new Web3(window.ethereum);
        
              const chain = await web3.eth.getChainId();
    
            console.log(chain);
            const MarketArtifact = await import("../../abis/BondMarket.json"); 
            const Bondcontract = await import("../../abis/Bondcontract.json");
            const addrs = await import("../../abis/map.json");
            
            const contractAddressObj = addrs["80001"];
    
            const bondmarketArray = contractAddressObj.SalaryBondContract;
    
            const marketArray = contractAddressObj.BondMarket;
    
            const marketAddress = marketArray.at(0);
            const contractAddress = bondmarketArray.at(0);
            //setBondAddresses(contractAddress);
            console.log(contractAddress);
            console.log(marketAddress);
        
            const bondContract = new web3.eth.Contract(
              Bondcontract.abi,
              contractAddress,
              {from: wallet, gasPrice: '20000000000'}
            );

            bondContract.options.gasPrice = '20000000000';
            bondContract.options.gas = 5000000;
            
            try {
                let tx = await bondContract.methods.createBondFromOffer('1').send(
                {
                    from: wallet,
                    //value: 500000000000000,
                }
            ).on('receipt', function(receipt) {
                console.log(receipt);
            })
            console.log(tx);
            } catch (err) {
                console.log(err);
            }
            
                
              //setBondContract(bContract);
            //const marketContract = new web3.eth.Contract(MarketArtifact.abi, marketAddress, {from: wallet, gasPrice: '20000000000'});
            //marketContract.methods.createBondfromOffer(1).send()
            //console.log( `Gas Limit:  ${marketContract.defaultAccount}`)

            }
            
            catch(err) {
              console.error();
            }
        } else {
            console.log("Metamask Not found");
        }
    }


    return (
        <Card border="primary" bg="dark" className="mb-3" text="white" style={{width: "18rem"}}>
        <Container>
            <Card.Header text="aliceblue" >Bond Id: {position}</Card.Header>
        </Container>
        
        <Card.Body>
            
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Required: </Col>
                            <Col> {amountRequired/DIVISOR} </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Start: </Col>
                            <Col> {startTime/SECONDS_DAY} </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> End: </Col>
                            <Col> {endTime/SECONDS_DAY} </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Duration: </Col>
                            <Col> {duration/SECONDS_DAY} </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Token: </Col>
                            <Col> {`${token.substring(0, 5)}..${token.substring(38)}` } </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Seller: </Col>
                            <Col> {`${seller.substring(0, 5)}..${seller.substring(38)}`} </Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>
            <Container>
                <Card.Text> 
                    <Container>
                        <Row> 
                            <Col> Buyer: </Col>
                            <Col> {`${buyer.substring(0, 5)}..${buyer.substring(38)}`}</Col>
                        </Row> 
                    </Container>
                </Card.Text>
            </Container>

            <Container>
                <Button variant="primary" onClick={acceptBond}> Accept Bond </Button>
            </Container>
            
        </Card.Body>
    </Card>
    )

        {
//        <div className="bond">
//            <div className="bondId">
//                <h1>
//                    Bond: {position}
//                </h1>
//            </div>
//            <div className="bondDes">
//                <p>
//                    <b>
//                        {token}
//                    </b>
//                </p>
//                <p>
//                    <b>
//                        {seller}
//                    </b>
//                </p>
//                <p>
//                    <b>
//                        {buyer}
//                    </b>
//                </p>
//                <p>
//                    {amountRequired}
//                </p>
//                <p>
//                    <b>
//                        {duration}
//                    </b>
//                </p>
//                <p>
//                    <b>
//                        {startTime}
//                    </b>
//                </p>
//                <p>
//                    <b>
//                        {endTime}
//                    </b>
//                </p>
//                <p>
//                    <b>
//                        {position}
//                    </b>
//                </p>
//            </div>
//
//            <button className="addToMarketBtn"> addTochart</button>
//        </div>
}
}