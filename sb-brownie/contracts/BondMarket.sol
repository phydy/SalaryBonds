// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {IBondContract} from "../interfaces/IBondContract.sol";

import {IBondMarket} from "../interfaces/IBondMarket.sol";

import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

import {IRouter} from "../interfaces/IRouter.sol";

error Transfer__failed();

contract BondMarket {
    using Counters for Counters.Counter;

    /**
     * bond contract
     */

    IBondContract private _bondContract;

    IRouter public _router;

    Counters.Counter private _bondCount;

    /**
     * every bond mapped to its id
     */
    mapping(uint256 => IBondMarket.Bond) private idBondinfo;

    IBondMarket.Bond[] private _openBonds;

    constructor(address bondContract, address router) {
        _bondContract = IBondContract(bondContract);
        _bondCount.increment();
        _router = IRouter(router);
    }

    // for functions only callable  by the bond contract
    modifier onlyBondCreatorContract() {
        require(msg.sender == address(_bondContract));
        _;
    }

    receive() external payable {}

    /**
     * add a bond to the contract for sale
     * param: seller_ the address receiving the salry
     * param: amountRequired_ the amount to be paid by buyer
     * param: duration_ how long the bond will last after buy
     */
    function addBond(
        ISuperToken token_,
        address seller_,
        address taker_,
        uint256 amountRequired_,
        uint256 duration_,
        uint256 start_time_,
        uint256 end_time_,
        uint256 position_
    ) external onlyBondCreatorContract returns (uint256 id) {
        id = _bondCount.current();
        IBondMarket.Bond memory bond_ = IBondMarket.Bond({
            token: token_,
            seller: seller_,
            buyer: taker_,
            amountRequired: amountRequired_,
            duration: duration_,
            start_time: start_time_,
            end_time: end_time_,
            position: start_time_ == 0 ? _openBonds.length : position_
        });
        idBondinfo[id] = bond_;

        if (start_time_ == 0) {
            _openBonds.push(bond_);
        }

        _bondCount.increment();
    }

    function deleteSortOpenBonds(uint256 id_, uint256 pos_) public {
        uint256 len_ = _openBonds.length;
        require(pos_ < len_);
        if (pos_ == len_ - 1) {
            _openBonds.pop();
        } else {
            _openBonds[pos_] = _openBonds[len_ - 1];
            _openBonds[pos_].position = pos_;
            _openBonds.pop();
        }
        ////update bond position
        idBondinfo[id_].position = pos_;
    }

    function updatePosition(uint256 bondId_, uint256 currentPos_)
        external
        onlyBondCreatorContract
    {
        idBondinfo[bondId_].position = currentPos_;
    }

    function acquireBond(uint256 bondId_) external {
        IBondMarket.Bond memory bond = idBondinfo[bondId_];
        require(bond.buyer == address(0));
        uint256 pos_ = bond.position;
        //require(
        //    bond.token.allowance(msg.sender, address(this)) >=
        //        bond.amountRequired,
        //    "NEF"
        //);
        //require(bond.token.balanceOf(msg.sender) >= bond.amountRequired, "BAL");
        bool success = bond.token.transferFrom(
            msg.sender,
            bond.seller,
            bond.amountRequired
        );
        if (!success) {
            revert Transfer__failed();
        }
        bond.buyer = msg.sender;
        bond.start_time = block.timestamp;
        bond.end_time = bond.duration + block.timestamp;
        bond.position = _bondContract.getActiveBondCount();
        idBondinfo[bondId_] = bond;
        deleteSortOpenBonds(bondId_, pos_);
        _bondContract.activateBond(bond);

        uint256 _flowRateAllowance = bond.amountRequired; //+
        //((bondRequest.amountRequired * 50) / 1000); //custom percentage to add

        uint256 _flowRate = _flowRateAllowance / bond.duration;

        int96 flowRate = int96(int256(_flowRate));

        _router.addBondtoUser(
            bond.token,
            bond.seller,
            msg.sender,
            bondId_,
            flowRate
        );
    }

    function getOpenBonds() external view returns (IBondMarket.Bond[] memory) {
        return _openBonds;
    }

    function getBond(uint256 id)
        external
        view
        returns (IBondMarket.Bond memory)
    {
        return idBondinfo[id];
    }
}
