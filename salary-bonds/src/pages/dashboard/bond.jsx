import React from "react";
import logo from "../../logo.svg";


export const Bond = (props) => {
    const {token, seller, buyer, amountRequired, duration, startTime, endTime} = props.data;
    return (
        <div className="bond">
            <img src={logo} alt="just a sample"></img>
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
                    ${amountRequired}
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
            </div>

            <button className="addToMarketBtn"> addTochart</button>
        </div>
    )
}