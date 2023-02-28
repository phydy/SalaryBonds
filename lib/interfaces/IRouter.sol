// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import {IBondMarket, ISuperToken} from "./IBondMarket.sol";

interface IRouter {
    function addBondtoUser(
        ISuperToken _acceptedToken,
        address user_,
        address streamReceiver,
        uint256 bondId_,
        int96 expectedFlow
    ) external;

    function getAddressAvailable(ISuperToken _acceptedToken, address user)
        external
        view
        returns (int96 available);
}
