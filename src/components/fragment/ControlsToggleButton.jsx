import React, { useState } from "react";
import "../assets/scss/ControlsToggleButton.scss";
import Button from "@material-ui/core/Button";

function ControlsToggleButton({ type, defaultIcon, changeIcon, onClicked, style }) {
    const [buttonType, setButton] = useState(type === "prev" || type === "next" ? true : false);

    function handleChange() {
        if (type === "prev" || type === "next") {
            setButton(true); // Для prev/next всегда true
        } else {
            setButton(!buttonType);
        }

        if (onClicked) {
            onClicked(type, !buttonType);
        }
    }

    return (
        <Button
            style={style}
            onClick={handleChange}
            className={`control-btn ${buttonType ? "active" : ""}`}>
            {buttonType ? changeIcon : defaultIcon}
        </Button>
    );
}

export default ControlsToggleButton;
