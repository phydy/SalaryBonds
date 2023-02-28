// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {BondMarket} from "../src/BondMarket.sol";
import {SalaryBondContract} from "../src/SalaryBonds.sol";
import {Router} from "../src/Router.sol";
import {SuperfluidTester} from "./SuperfluidTester.sol";
import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperToken.sol";
import {TestToken} from "../src/TestToken.sol";
import {ISuperTokenFactory} from "@superfluid/interfaces/superfluid/ISuperTokenFactory.sol";
import {SuperTokenV1Library} from "@superfluid/apps/SuperTokenV1Library.sol";
import {IBondMarket} from "lib/interfaces/IBondMarket.sol";

contract CounterTest is SuperfluidTester {
    using SuperTokenV1Library for ISuperToken;

    BondMarket public bondMarket;
    SalaryBondContract public bondContract;
    TestToken private token;
    ISuperTokenFactory public factory;
    Router public router;

    address sf_admin = makeAddr("superfluid_admin");
    address token_holder = makeAddr("token_holder");

    address bondrequestor = makeAddr("bondrequestor");
    address bondseller = makeAddr("bondseller");

    address buyer = makeAddr("buyer");

    constructor() SuperfluidTester(sf_admin) {}

    function setUp() public {
        token = new TestToken();
        bondContract = new SalaryBondContract(address(sf.host));

        factory = sf.host.getSuperTokenFactory();
        router = new Router(sf.host, sf.cfa, address(bondContract));
        bondMarket = new BondMarket(address(bondContract), address(router));
        token.initialize(
            address(factory),
            "Sal Token",
            "SSTN",
            token_holder,
            4000000 ether
        );
        //bondMarket.addRouter(address(router));
        bondContract.addBondMarket(address(bondMarket), address(router));

        vm.startPrank(token_holder);
        ISuperToken(address(token)).transfer(address(router), 100000 ether);

        ISuperToken(address(token)).transfer(bondseller, 1000000 ether);
        ISuperToken(address(token)).transfer(bondrequestor, 1000000 ether);
        ISuperToken(address(token)).transfer(buyer, 1000000 ether);

        vm.stopPrank();
    }

    function testAddBondMarket() public {
        assertEq(
            ISuperToken(address(token)).balanceOf(token_holder),
            900000 ether
        );

        bondContract.addBondMarket(address(bondMarket), address(router));

        assert(address(bondMarket) == address(bondContract._bondMarket()));
    }

    function testAddBond() public {
        vm.startPrank(bondseller);

        bytes memory callData = abi.encodeCall(
            sf.cfa.createFlow,
            (
                ISuperToken(address(token)),
                address(router),
                0.005 ether,
                new bytes(0)
            )
        );
        sf.host.callAgreement(sf.cfa, callData, new bytes(0));

        int96 flow = ISuperToken(address(token)).getFlowRate(
            address(router),
            bondseller
        );
        int96 flow1 = ISuperToken(address(token)).getFlowRate(
            bondseller,
            address(router)
        );
        assert(flow == flow1);

        uint256 duration = 30 days;
        uint256 amount = uint256(int256(flow)) * duration;

        uint256 amountReceive = amount - ((amount * 50) / 1000);
        vm.deal(bondseller, 1 ether);

        uint256 id = bondContract.createBond{value: 0.0005 ether}(
            ISuperToken(address(token)),
            amountReceive,
            duration
        );

        assert(id == 1);
        vm.stopPrank();

        vm.startPrank(buyer);
        assert(ISuperToken(address(token)).balanceOf(buyer) == 1000000 ether);

        IBondMarket.Bond memory bond_ = bondMarket.getBond(id);

        assert(bond_.token == ISuperToken(address(token)));
        assert(bond_.amountRequired == amountReceive);
        ISuperToken(address(token)).approve(address(bondMarket), amountReceive);
        assert(
            ISuperToken(address(token)).allowance(buyer, address(bondMarket)) ==
                amountReceive
        );
        assert(ISuperToken(address(token)).balanceOf(buyer) > amountReceive);

        bondMarket.acquireBond(id);

        (, int96 fr_, , ) = sf.cfa.getFlow(
            ISuperToken(address(token)),
            address(router),
            buyer
        );
        assert(fr_ > 0);
    }
}
