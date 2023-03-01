// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import {ConstantFlowAgreementV1} from "@superfluid/agreements/ConstantFlowAgreementV1.sol";
import {ISuperfluid} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";
import {IConstantFlowAgreementHook} from "@superfluid/interfaces/agreements/IConstantFlowAgreementHook.sol";

contract CFA is ConstantFlowAgreementV1 {
    constructor(ISuperfluid host, IConstantFlowAgreementHook _hookAddress)
        ConstantFlowAgreementV1(host, _hookAddress)
    {}
}
