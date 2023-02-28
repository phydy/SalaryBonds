import React from "react";
import logo from "../../logo.svg";


export const Bond = (props) => {
    const {token, seller, buyer, amountRequired, duration, startTime, endTime, position} = props.data;
    return (
        <div className="bond">
            <div className="bondId">
                <h1>
                    Bond: {position}
                </h1>
            </div>
            <div className="bondDes">
                <p>
                    <b>
                        {token}
                    </b>
                </p>
                <p>
                    <b>
                        {seller}
                    </b>
                </p>
                <p>
                    <b>
                        {buyer}
                    </b>
                </p>
                <p>
                    {amountRequired}
                </p>
                <p>
                    <b>
                        {duration}
                    </b>
                </p>
                <p>
                    <b>
                        {startTime}
                    </b>
                </p>
                <p>
                    <b>
                        {endTime}
                    </b>
                </p>
                <p>
                    <b>
                        {position}
                    </b>
                </p>
            </div>

            <button className="addToMarketBtn"> addTochart</button>
        </div>
    )
}