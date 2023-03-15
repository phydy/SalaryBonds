// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IBondContract} from "lib/interfaces/IBondContract.sol";

import {IBondMarket} from "lib/interfaces/IBondMarket.sol";
import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid/interfaces/superfluid/ISuperfluid.sol";

import {SuperTokenV1Library} from "@superfluid/apps/SuperTokenV1Library.sol";

import {IConstantFlowAgreementV1} from "@superfluid/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid/apps/SuperAppBase.sol";

/// @dev Constant Flow Agreement registration key, used to get the address from the host.
bytes32 constant CFA_ID = keccak256(
    "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
);

/// @dev Thrown when the receiver is the zero adress.
error InvalidReceiver();

/// @dev Thrown when receiver is also a super app.
error ReceiverIsSuperApp();

/// @dev Thrown when the callback caller is not the host.
error Unauthorized();

/// @dev Thrown when the token being streamed to this contract is invalid
error InvalidToken();

/// @dev Thrown when the agreement is other than the Constant Flow Agreement V1
error InvalidAgreement();

error No__Flow();

error Flow__Deficit();

contract Router is SuperAppBase {
    /// @notice Importing the SuperToken Library to make working with streams easy.
    using SuperTokenV1Library for ISuperToken;

    // ---------------------------------------------------------------------------------------------
    // STORAGE & IMMUTABLES

    /// @notice Constant used for initialization of CFAv1 and for callback modifiers.
    //bytes32 public constant CFA_ID =
    //    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

    /// @notice Superfluid Host.
    ISuperfluid public immutable _host;

    IConstantFlowAgreementV1 public immutable cfa;

    /**
     * tracks the accumulated amount wich is used as colateral before the
     */

    struct SellerBonds {
        int96 outFlow;
        uint256[] bondIds;
    }
    mapping(address => SellerBonds) private sellerBondIds;

    IBondContract private bondContract;

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 _cfa,
        address bondCon //, //string memory regKey
    ) {
        assert(address(host) != address(0));
        //assert(address(acceptedToken) != address(0));
        //assert(receiver != address(0));
        _host = host;
        cfa = _cfa;
        bondContract = IBondContract(bondCon);

        // Registers Super App, indicating it is the final level (it cannot stream to other super
        // apps), and that the `before*` callbacks should not be called on this contract, only the
        // `after*` callbacks.
        //host.registerAppWithKey(
        //    SuperAppDefinitions.APP_LEVEL_FINAL |
        //        SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
        //        SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
        //        SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP,
        //    regKey
        //);
        host.registerApp(
            SuperAppDefinitions.APP_LEVEL_FINAL |
                SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
                SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
                SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP
        );
    }

    function getAddressAvailable(
        ISuperToken _acceptedToken,
        address user
    ) external view returns (int96 available) {
        SellerBonds memory info = sellerBondIds[user];
        int96 outFlowRate = _acceptedToken.getFlowRate(address(this), user);
        int96 inFlowRate = _acceptedToken.getFlowRate(user, address(this));
        if (inFlowRate <= 0) {
            available = 0;
        } else if (info.bondIds.length > 0) {
            available = inFlowRate - (outFlowRate - info.outFlow);
        } else if (info.bondIds.length == 0 && inFlowRate == outFlowRate) {
            available = outFlowRate;
        }
    }

    function addBondtoUser(
        ISuperToken _acceptedToken,
        address user_,
        address streamReceiver,
        uint256 bondId_,
        int96 expectedFlow
    ) external {
        int96 inFlowRate = _acceptedToken.getFlowRate(user_, address(this));

        SellerBonds storage ids = sellerBondIds[user_];
        if (inFlowRate == 0) {
            revert No__Flow();
        } else if (inFlowRate < expectedFlow) {
            revert Flow__Deficit();
        } else {
            //sellerBondIds[user_].length == 0 ? sellerBondIds[user_].push(bondId_) :
            if (ids.outFlow == 0) {
                ids.outFlow = expectedFlow;
                ids.bondIds.push(bondId_);
            } else {
                require(
                    (inFlowRate - ids.outFlow) >= expectedFlow,
                    "Flow deficit: router"
                ); //require inflow to support all active bonds
                ids.outFlow += expectedFlow;
                ids.bondIds.push(bondId_);
            }
        }
        int96 outFlowRate = _acceptedToken.getFlowRate(address(this), user_);
        _acceptedToken.updateFlow(user_, (outFlowRate - expectedFlow));

        _acceptedToken.createFlow(streamReceiver, expectedFlow, new bytes(0));
    }

    function afterAgreementCreated(
        ISuperToken _superToken,
        address, // _agreementClass,
        bytes32, //_agreementId
        bytes calldata, //_agreementData
        bytes calldata, //_cbdata
        bytes calldata _ctx
    )
        external
        override
        returns (
            //onlyExpected(_superToken, _agreementClass)
            //onlyHost
            bytes memory newCtx
        )
    {
        return _updateOutflow(_ctx, _superToken);
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        address, // _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, // _agreementData,
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        returns (
            //onlyExpected(_superToken, _agreementClass)
            //onlyHost
            bytes memory newCtx
        )
    {
        newCtx = _doUpdate(_ctx, _superToken);
    }

    function _doUpdate(
        bytes calldata _ctx,
        ISuperToken _superToken
    ) private returns (bytes memory newCtx) {
        ISuperfluid.Context memory dContext = _host.decodeCtx(_ctx);
        address sender = dContext.msgSender;
        int96 inFlowRate = _superToken.getFlowRate(sender, address(this));
        int96 outFlowRate = _superToken.getFlowRate(address(this), sender);
        int96 info = sellerBondIds[sender].outFlow;

        newCtx = outFlowRate == 0
            ? _superToken.createFlowWithCtx(sender, (inFlowRate - info), _ctx)
            : _superToken.updateFlowWithCtx(sender, (inFlowRate - info), _ctx);
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, // _agreementData
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        returns (
            //onlyHost
            bytes memory newCtx
        )
    {
        // According to the app basic law, we should never revert in a termination callback
        if (
            /*_superToken != _acceptedToken ||*/
            _agreementClass != address(cfa)
        ) {
            return _ctx;
        }
        return _updateOutflow(_ctx, _superToken);
    }

    /// @dev Updates the outflow. The flow is either created, updated, or deleted, depending on the
    /// net flow rate.
    /// @param ctx The context byte array from the Host's calldata.
    /// @return newCtx The new context byte array to be returned to the Host.
    function _updateOutflow(
        bytes calldata ctx,
        ISuperToken _acceptedToken
    ) private returns (bytes memory newCtx) {
        newCtx = ctx;
        ISuperfluid.Context memory dContext = _host.decodeCtx(ctx);
        //int96 netFlowRate = _acceptedToken.getNetFlowRate(address(this));
        address _receiver = dContext.msgSender;

        int96 outFlowRate = _acceptedToken.getFlowRate(
            address(this),
            _receiver
        );
        int96 inFlowRate = _acceptedToken.getFlowRate(_receiver, address(this));

        //int96 inFlowRate = netFlowRate + outFlowRate;

        if (inFlowRate == 0) {
            // The flow does exist and should be deleted.
            newCtx = _acceptedToken.deleteFlowWithCtx(
                address(this),
                _receiver,
                ctx
            );
        } else if (outFlowRate != 0) {
            // The flow does exist and needs to be updated.
            newCtx = _acceptedToken.updateFlowWithCtx(
                _receiver,
                inFlowRate,
                ctx
            );
        } else {
            // The flow does not exist but should be created.
            newCtx = _acceptedToken.createFlowWithCtx(
                _receiver,
                inFlowRate,
                ctx
            );
        }
    }
}
