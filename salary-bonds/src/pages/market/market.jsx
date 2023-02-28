import React from "react";

import { BONDS } from "../../bonds";

import { BondRequest } from "../dashboard/bondReq";
export const Market = () => {
    return (
        <div className="dashboard">
            <div className="dashTitle">
                <h1>
                Bond Market 
                </h1>
            </div>
            <div className="bonds">
                {""}
                {
                    BONDS.map((bond) => (
                        <BondRequest data={bond} />
                    ))
                }
            </div>
        </div>
    )
}