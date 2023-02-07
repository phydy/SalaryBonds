// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

interface IBondContract {
    function createBond(
        ISuperToken token_,
        address seller_,
        uint256 amountRequired_,
        uint256 duration_
    ) external;
}
