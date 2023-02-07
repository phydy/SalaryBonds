import React from "react";

import { BONDS } from "../../bonds";

import { Bond } from "./bond";

import "./dashboard.css";

export const Dashboard = () => {
    return (
        <div className="dashboard">
            <div className="dashTitle">
                <h1>
                    Slalary Bond
                </h1>
            </div>
            <div className="bonds">
                {""}
                {
                    BONDS.map((bond) => (
                        <Bond data={bond} />
                    ))
                }
            </div>
        </div>
    )
}