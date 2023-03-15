// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {IBondMarket} from "./IBondMarket.sol";
import {ISuperToken} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";
import {IRouter} from "lib/interfaces/IRouter.sol";

interface IBondContract {
    function createBond(
        ISuperToken token_,
        address seller_,
        uint256 amountRequired_,
        uint256 duration_
    ) external returns (uint256);

    function requestBond(
        ISuperToken token_,
        uint256 amountGiven_,
        uint256 amountRequired_,
        uint256 duration_
    ) external payable returns (uint256);

    function activateBond(IBondMarket.Bond memory bond_) external;

    function getActiveBondCount() external view returns (uint256 count);

    function _router() external returns (IRouter);
}
