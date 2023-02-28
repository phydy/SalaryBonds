import React from "react";

import { Bond } from "./bond";

import "./dashboard.css";

import Web3 from "web3";

import { useState } from "react";
import { getActiveBonds, getProvider } from "../../utils/utils";



export function Dashboard(props) {

    const {bondContract, bonds, bondReqs} = props.data;
    const web3 = new Web3(window.ethereum);


    const createBond = async() => {

    }

    const createBondrequest = async() => {

    }

    const giveAclPermissions = async() => {

    }

    return (
        <div className="dashboard">
            <div className="dashTitle">
                <h1>
                    Salary Bond
                </h1>
            </div>
            <div className="bonds">
                {""}
                {
                    bonds.map((bond) => (
                        <Bond data={bond} />
                    ))
                }
            </div>
        </div>
    )
}

