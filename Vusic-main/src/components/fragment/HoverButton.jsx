import React, { useContext, useState } from 'react';
import '../assets/scss/HoverButton.scss';
import { Button } from "@material-ui/core";
import { ThemeContext } from "../../api/Theme";
import { Link } from "react-router-dom";

function HoverButton({ text, variant, Icon }) {
    const useStyle = useContext(ThemeContext) || {}; // 👈 добавили fallback, чтобы не было undefined
    const buttonStyles = useStyle.button || {}; // 👈 проверяем наличие button
    const hoverStyle = buttonStyles.onHover || {}; // 👈 проверяем наличие onHover

    const [currStyle, setCurrStyle] = useState({});

    const handleOver = () => {
        setCurrStyle(hoverStyle);
    };
    
    const handleOut = () => {
        setCurrStyle({});
    };

    return (
        <Link to={"/home/" + text.toLowerCase()} className={"hb"}>
            <Button style={currStyle}
                    startIcon={Icon ? <Icon /> : null}
                    variant={variant}
                    onMouseOver={handleOver} 
                    onMouseOut={handleOut}>
                {text}
            </Button>
        </Link>
    );
}

export default HoverButton;
