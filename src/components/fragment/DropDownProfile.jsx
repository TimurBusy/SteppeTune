import React, { useContext } from "react";
import '../assets/scss/DropDownProfile.scss';
import { ThemeContext } from "../../api/Theme";
import HoverButton from "./HoverButton";
import { AccountBox } from "@material-ui/icons";

const DropDownProfile = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <div style={theme.component} className="dropdown-profile">
            <HoverButton 
                Icon={AccountBox} 
                variant={"text"} 
                text={"Profile"} 
                style={{ color: "var(--profile-icon-color)" }} // 🟢 Динамический цвет иконки
            />
        </div>
    );
};

export default DropDownProfile;
