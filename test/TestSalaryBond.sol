// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {BondMarket} from "../src/BondMarket.sol";
import {SalaryBondContract} from "../src/SalaryBonds.sol";

import {SuperfluidTester} from "./SuperfluidTester.sol";
import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperToken.sol";
import {TestToken} from "../src/TestToken.sol";
import {ISuperTokenFactory} from "@superfluid/interfaces/superfluid/ISuperTokenFactory.sol";

contract CounterTest is SuperfluidTester {
    BondMarket public bondMarket;
    SalaryBondContract public bondContract;
    TestToken private token;
    ISuperTokenFactory public factory;

    address sf_admin = makeAddr("superfluid_admin");
    address token_holder = makeAddr("token_holder");

    constructor() SuperfluidTester(sf_admin) {}

    function setUp() public {
        token = new TestToken();
        bondContract = new SalaryBondContract(address(sf.host));
        bondMarket = new BondMarket(address(bondContract));
        factory = sf.host.getSuperTokenFactory();

        token.initialize(
            address(factory),
            "Sal Token",
            "SSTN",
            token_holder,
            2000000 ether
        );
    }

    function testAddBondMarket() public {
        assertEq(
            ISuperToken(address(token)).balanceOf(token_holder),
            2000000 ether
        );

        bondContract.addBondmarket(address(bondMarket));

        assert(address(bondMarket) == address(bondContract._bondMarket()));
    }

    function testSetNumber(uint256 x) public {}
}
