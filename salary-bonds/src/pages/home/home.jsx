import React from "react";
//import{ Container, Row ,Col} from "react-bootstrap";
import "./home.css";


export const Home = () => {
    return (
      <div className="home">
        <div className="home-header">
          <div className="header-left">
            <div>
                <h1 className="">
                    Slary Bonds
                </h1>
                <h2>
                    Use your salary to offer Bonds
                </h2>
                <h3>
                    Payed in Superfluid streams?
                    Then you are at the right place
                </h3>
            </div>
          </div>
          <div className="header-right">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi accusantium, omnis doloremque mollitia quidem nihil amet alias inventore dolorem eius maxime esse quasi laboriosam, voluptatum repudiandae voluptate similique a ducimus.
          </div>
        </div>
      </div>
    )
  }