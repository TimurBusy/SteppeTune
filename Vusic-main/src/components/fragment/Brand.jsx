import React from "react";
import { Link } from "react-router-dom";
import "../assets/scss/Brand.scss";
import Logo from "../assets/img/image 9.png";

class Brand extends React.Component {
    render() {
        return (
            <div className="brand">
                <Link to="/home">
                    <img src={Logo} alt="Описание" />
                    <h1>SteppeTune</h1>
                </Link>
            </div>
        );
    }
}

export default Brand;
