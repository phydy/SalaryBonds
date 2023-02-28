import React from "react";
import { Card, Button, ListGroup, Container, Row, Col } from "react-bootstrap";
import logo from "../../logo.svg";
import Web3 from "web3";

export const BondRequest = (props) => {





    //<img src={logo} alt="just a sample"></img>
    const {token, requestor, taker, AmountGiven, amountRequired, duration, position} = props.data[0];
    //const {bondContract} = props.data[1];
    const wallet = props.data[2]; 
    const DIVISOR = 1000000000000000000;
    const SECONDS_DAY = 86400;
    //let bondContract;



    const acceptBond = async () => {
        console.log(`Accepting bond Id: ${position}`);
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
              const web3 = new Web3(window.ethereum);
    
              const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
              //setWalletAddress(accounts[0]);
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
              {from: wallet}
            );

            //let gasLimit = await bondContract.methods.createBondFromOffer(position).estimateGas(
            //    {
            //        from: wallet,
            //        value: 500000000000000,
            //    }
            //)
            console.log(bondContract)
                
              //setBondContract(bContract);
            const marketContract = new web3.eth.Contract(MarketArtifact.abi, marketAddress);
            let gasLimit = await bondContract.methods.createBondFromOffer(position).estimateGas(
                {
                    from: wallet,
                    value: 100000000
                }
            )
            console.log( `Gas Limit:  ${gasLimit}`)

            }
            
            catch(err) {
              console.error();
            }
        } else {
            console.log("Metamask Not found");
        }
    




        //try {
        //    let gasLimit = await bondContract.methods.createBondFromOffer(position).estimateGas(
        //        {
        //            from: wallet
        //        }
        //    )
        //    console.log( `Gas Limit:  ${gasLimit}`)
        //} catch (err) {
        //    console.error();
        //}
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
                                <Col> Given: </Col>
                                <Col> {AmountGiven/DIVISOR} </Col>
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
                                <Col> {`${requestor.substring(0, 5)}..${requestor.substring(38)}`} </Col>
                            </Row> 
                        </Container>
                    </Card.Text>
                </Container>
                <Container>
                    <Card.Text> 
                        <Container>
                            <Row> 
                                <Col> Buyer: </Col>
                                <Col> {`${taker.substring(0, 5)}..${taker.substring(38)}`}</Col>
                            </Row> 
                        </Container>
                    </Card.Text>
                </Container>

                <Container>
                    <Button variant="primary" onClick={acceptBond}> Accept Bond </Button>
                </Container>
                
            </Card.Body>
        
        {

        //        <div className="bond">
        //        <div className="reqId">
        //            <h1>
        //                Bond Request: {position}
        //            </h1>
        //        </div>
        //        <div className="bondDes">
        //            <div>
        //                <p className="token">
        //                    <b>
        //                        {token}
        //                    </b>
        //                </p>
        //            </div>
        //            <div>
        //                <p className="address">
        //                    <b>
        //                        {requestor}
        //                    </b>
        //                </p>
        //            </div>
        //            <div>
        //                <p className="address">
        //                    <b>
        //                        {taker == "0x0000000000000000000000000000000000000000" ? taker: "no taker"}
        //                    </b>
        //                </p>
        //            </div>
        //            <div>
        //                <p className="num">
        //                    <b>
        //                    {AmountGiven}
        //                    </b>
                //
        //                </p>
        //            </div>
        //            <div>
        //                <p className="num">
        //                    <b>
        //                        {amountRequired}
        //                    </b>
        //                </p>
        //            </div>
        //            <div>
        //                <p className="num">
        //                    <b>
        //                        {duration}
        //                    </b>
        //                </p>
        //            </div>
        //        </div>
                //
        //        <button className="addToMarketBtn"> addTochart</button>
        //    </div>
        }
        </Card>
    )
}