// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IBondMarket} from "lib/interfaces/IBondMarket.sol";
import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

import {SuperTokenV1Library} from "@superfluid/apps/SuperTokenV1Library.sol";

import {IConstantFlowAgreementV1} from "@superfluid/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid/apps/SuperAppBase.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

error Bond__Already__Taken();

error Transfer__failed();

contract SalaryBondContract is SuperAppBase, Ownable {
    /// @notice Importing the SuperToken Library to make working with streams easy.
    using SuperTokenV1Library for ISuperToken;

    using Counters for Counters.Counter;
    // ---------------------------------------------------------------------------------------------
    // STORAGE & IMMUTABLES

    /// @notice Constant used for initialization of CFAv1 and for callback modifiers.
    bytes32 public constant CFA_ID =
        keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

    /// @notice Superfluid Host.
    ISuperfluid public immutable host;

    IConstantFlowAgreementV1 public immutable cfa;
    /**
     * Bond market contract
     */

    IBondMarket public _bondMarket;

    mapping(ISuperToken => bool) public isAllowedTpken;

    /**
     * bond counter
     */

    Counters.Counter private _bondRequestCount;

    //Counters.Counter private _bondCount;
    /**
     * every bond request to its Id
     */

    mapping(uint256 => IBondMarket.BondRequest) private _bondRequests;

    constructor(address _host) {
        host = ISuperfluid(_host);
        // CFA lib initialization
        cfa = IConstantFlowAgreementV1(address(host.getAgreementClass(CFA_ID)));

        _bondRequestCount.increment();
    }

    receive() external payable {}

    function addAllowedToken(address tokenAddress) external onlyOwner {
        isAllowedTpken[ISuperToken(tokenAddress)] = true;
    }

    function addBondmarket(address market_) external onlyOwner {
        _bondMarket = IBondMarket(market_);
    }

    function createBond(
        ISuperToken token_,
        address seller_,
        uint256 amountRequired_,
        uint256 duration_
    ) external payable {
        // pay some fee
        require(msg.value > 0.0005 ether);

        uint256 _flowRateAllowance = amountRequired_ +
            ((amountRequired_ * 50) / 1000); //custom percentage to add

        uint256 _flowRate = _flowRateAllowance / duration_;

        int96 flowRate = int96(int256(_flowRate));

        //check ACL permisions
        (, uint8 permissions, int96 flowrateAllowance) = cfa
            .getFlowOperatorData(token_, msg.sender, address(this));

        //assert that the permissions are right

        require(permissions == uint8(5), "wromg permission: put 5");
        require(flowrateAllowance >= flowRate, "not enought allowance");

        //add info to the market
        _bondMarket.addBond(token_, seller_, amountRequired_, duration_);
    }

    /**
     * add a bond to the contract for sale
     * param: requestor_ the address requesting the stream
     * param; taker_ the person offering the bond
     * param: amountRequired_ the amount to be paid by buyer
     * param: duration_ how long the bond will last after buy
     */

    function requestBond(
        ISuperToken token_,
        address requestor_,
        address taker_,
        uint256 amountGiven_,
        uint256 amountRequired_,
        uint256 duration_
    ) external payable {
        require(amountGiven_ <= amountRequired_, "non profitable");

        require(msg.value == 0.0005 ether, "pay fee");
        bool success = token_.transferFrom(
            msg.sender,
            address(this),
            amountGiven_
        );

        if (!success) {
            revert Transfer__failed();
        }
        _bondRequests[_bondRequestCount.current()] = IBondMarket.BondRequest({
            token: token_,
            requestor: requestor_,
            taker: taker_,
            amountGiven: amountGiven_,
            amountRequired: amountRequired_,
            duration: duration_
        });
    }

    function createBondFromOffer(uint256 offerId_) external payable {
        IBondMarket.BondRequest memory bondRequest = _bondRequests[offerId_];
        if (bondRequest.taker == address(0)) {
            revert Bond__Already__Taken();
        }
        require(msg.value >= 0.0005 ether, "pay fee");

        uint256 _flowRateAllowance = bondRequest.amountRequired +
            ((bondRequest.amountRequired * 50) / 1000); //custom percentage to add

        uint256 _flowRate = _flowRateAllowance / bondRequest.duration;

        int96 flowRate = int96(int256(_flowRate));

        //check ACL permisions
        (, uint8 permissions, int96 flowrateAllowance) = cfa
            .getFlowOperatorData(bondRequest.token, msg.sender, address(this));

        //assert that the permissions are right

        require(permissions == uint8(5), "wromg permission: put 5");
        require(flowrateAllowance >= flowRate, "not enought allowance");
    }

    function getBondCount() external view returns (uint256 count) {
        count = _bondRequestCount.current();
    }

    function getBondrequest(uint256 id_)
        external
        view
        returns (IBondMarket.BondRequest memory request)
    {
        request = _bondRequests[id_];
    }
}
