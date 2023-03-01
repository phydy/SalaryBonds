// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IBondMarket} from "../interfaces/IBondMarket.sol";
import {IRouter} from "../interfaces/IRouter.sol";

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

import {SuperTokenV1Library} from "@superfluid/apps/SuperTokenV1Library.sol";

import {IConstantFlowAgreementV1} from "@superfluid/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid/apps/SuperAppBase.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {IRouter} from "../interfaces/IRouter.sol";

error Bond__Already__Taken();

error Transfer__failed();

contract SalaryBondContract is Ownable {
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

    IRouter public _router;

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

    IBondMarket.BondRequest[] private _activeBondrequests;

    IBondMarket.Bond[] private _activeBonds;

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

    function addBondMarket(address market_, address router) external onlyOwner {
        _bondMarket = IBondMarket(market_);
        _router = IRouter(router);
    }

    function createBond(
        ISuperToken token_,
        uint256 amountRequired_,
        uint256 duration_
    ) external payable returns (uint256) {
        // pay some fee
        require(msg.value >= 0.0005 ether);

        uint256 _flowRateAllowance = amountRequired_ +
            ((amountRequired_ * 50) / 1000); //custom percentage to add

        uint256 _flowRate = _flowRateAllowance / duration_;

        int96 flowRate = int96(int256(_flowRate));

        //check ACL permisions
        (, , int96 fr) = cfa.getFlowOperatorData(
            token_,
            msg.sender,
            address(this)
        );

        //assert that the permissions are right
        //
        int96 av = _router.getAddressAvailable(token_, msg.sender);

        //require(permissions == uint8(5), "wromg permission: put 5");
        require(av >= flowRate || fr >= flowRate, "not enought allowance");

        if (av == 0 && fr >= flowRate) {
            cfa.createFlowByOperator(
                token_,
                msg.sender,
                address(_router),
                flowRate,
                new bytes(0)
            );
        }

        //add info to the market
        uint256 id = _bondMarket.addBond(
            token_,
            msg.sender,
            address(0),
            amountRequired_,
            duration_,
            0,
            0,
            0
        );
        return id;
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
        uint256 pos = _activeBondrequests.length;
        IBondMarket.BondRequest memory request = IBondMarket.BondRequest({
            token: token_,
            requestor: msg.sender,
            taker: address(0),
            amountGiven: amountGiven_,
            amountRequired: amountRequired_,
            duration: duration_,
            position: pos
        });
        _bondRequests[_bondRequestCount.current()] = request;
        _activeBondrequests.push(request);
    }

    function createBondFromOffer(uint256 offerId_) external payable {
        IBondMarket.BondRequest memory bondRequest = _bondRequests[offerId_];
        if (bondRequest.taker != address(0)) {
            revert Bond__Already__Taken();
        }
        require(msg.value >= 0.0005 ether, "pay fee");

        uint256 _flowRateAllowance = bondRequest.amountRequired; //+
        //((bondRequest.amountRequired * 50) / 1000); //custom percentage to add

        uint256 _flowRate = _flowRateAllowance / bondRequest.duration;

        int96 flowRate = int96(int256(_flowRate));

        //check ACL permisions
        (, , int96 fr) = cfa.getFlowOperatorData(
            bondRequest.token,
            msg.sender,
            address(this)
        );
        int96 av = _router.getAddressAvailable(bondRequest.token, msg.sender);

        //assert that the permissions are right

        //require(permissions == uint8(5), "wromg permission: put 5");
        require(av >= flowRate || fr >= flowRate, "not enought allowance");
        if (av == 0 && fr >= flowRate) {
            cfa.createFlowByOperator(
                bondRequest.token,
                msg.sender,
                address(_router),
                flowRate,
                new bytes(0)
            );
        }
        uint256 id_ = _bondMarket.addBond(
            bondRequest.token,
            bondRequest.requestor,
            bondRequest.taker,
            bondRequest.amountRequired,
            bondRequest.duration,
            block.timestamp,
            (block.timestamp + bondRequest.duration),
            _activeBonds.length
        );
        uint256 pos_ = bondRequest.position;
        _activeBonds.push(
            IBondMarket.Bond({
                token: bondRequest.token,
                seller: bondRequest.requestor,
                buyer: bondRequest.taker,
                amountRequired: bondRequest.amountRequired,
                duration: bondRequest.duration,
                start_time: block.timestamp,
                end_time: (block.timestamp + bondRequest.duration),
                position: pos_
            })
        );
        _router.addBondtoUser(
            bondRequest.token,
            bondRequest.taker,
            bondRequest.requestor,
            id_,
            flowRate
        );
        deleteSortActiveRequests(offerId_, pos_);
        //cfa.createFlowByOperator(
        //    bondRequest.token,
        //    address(_router),
        //    bondRequest.requestor,
        //    flowRate,
        //    new bytes(0)
        //);
    }

    function activateBond(IBondMarket.Bond memory bond_) external {
        _activeBonds.push(bond_);
    }

    function deleteSortActiveBonds(uint256 id_, uint256 pos_) external {
        uint256 len_ = _activeBonds.length;
        require(pos_ < len_);
        if (pos_ == len_ - 1) {
            _activeBonds.pop();
        } else {
            _activeBonds[pos_] = _activeBonds[len_ - 1];
            _activeBonds[pos_].position = pos_;
            _activeBonds.pop();
        }
        //update bond position
        _bondMarket.updatePosition(id_, pos_);
    }

    function deleteSortActiveRequests(uint256 id_, uint256 pos_) private {
        uint256 len_ = _activeBondrequests.length;
        require(pos_ < len_);
        if (pos_ == len_ - 1) {
            _activeBondrequests.pop();
        } else {
            _activeBondrequests[pos_] = _activeBondrequests[len_ - 1];
            _activeBondrequests[pos_].position = pos_;
            _activeBondrequests.pop();
        }
        //update bond position
        _bondMarket.updatePosition(id_, pos_);
    }

    function getBondRequestCount() external view returns (uint256 count) {
        count = _bondRequestCount.current();
    }

    function getActiveBondCount() external view returns (uint256 count) {
        count = _activeBonds.length;
    }

    function getBondrequest(uint256 id_)
        external
        view
        returns (IBondMarket.BondRequest memory request)
    {
        request = _bondRequests[id_];
    }

    function getActiveBondrequests()
        external
        view
        returns (IBondMarket.BondRequest[] memory requests)
    {
        requests = _activeBondrequests;
    }

    function getActiveBonds()
        external
        view
        returns (IBondMarket.Bond[] memory bonds)
    {
        bonds = _activeBonds;
    }
}
