// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {IBondContract} from "lib/interfaces/IBondContract.sol";

import {IBondMarket} from "lib/interfaces/IBondMarket.sol";

import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

error Transfer__failed();

contract BondMarket {
    using Counters for Counters.Counter;

    /**
     * bond contract
     */

    IBondContract private _bondContract;

    Counters.Counter private _bondCount;

    /**
     * every bond mapped to its id
     */
    mapping(uint256 => IBondMarket.Bond) private idBondinfo;

    constructor(address bondContract) {
        _bondContract = IBondContract(bondContract);
        _bondCount.increment();
        //_bondrequestCount.increment();
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
        uint256 amountRequired_,
        uint256 duration_
    ) external onlyBondCreatorContract {
        idBondinfo[_bondCount.current()] = IBondMarket.Bond({
            token: token_,
            seller: seller_,
            buyer: address(0),
            amountRequired: amountRequired_,
            duration: duration_,
            start_time: 0,
            end_time: 0
        });
    }

    function acquireBond(uint256 bondId_) external {}
}
