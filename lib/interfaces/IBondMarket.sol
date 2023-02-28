// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

interface IBondMarket {
    /**
     * struct of bond requests
     */
    struct BondRequest {
        ISuperToken token;
        address requestor;
        address taker;
        uint256 amountGiven;
        uint256 amountRequired;
        uint256 duration;
        uint256 position;
    }

    //bond information
    struct Bond {
        ISuperToken token;
        address seller;
        address buyer;
        uint256 amountRequired;
        uint256 duration;
        uint256 start_time;
        uint256 end_time;
        uint256 position;
    }

    function getBondrequest(uint256 id_)
        external
        view
        returns (BondRequest memory request);

    function getBond(uint256 id)
        external
        view
        returns (IBondMarket.Bond memory);

    function addBond(
        ISuperToken token_,
        address seller_,
        address taker_,
        uint256 amountRequired_,
        uint256 duration_,
        uint256 start_time_,
        uint256 end_time_,
        uint256 position_
    ) external returns (uint256 id);

    function requestBond(
        ISuperToken token_,
        address requestor_,
        address taker_,
        uint256 amountGiven_,
        uint256 amountRequired_,
        uint256 duration_
    ) external;

    function updatePosition(uint256 bondId_, uint256 currentPos_) external;
}
