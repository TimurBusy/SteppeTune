import React, {useContext, useState, useEffect} from "react";
import '../assets/scss/Navigation.scss';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import DropDownLanguageList from "./DropDownLanguageList";
import SearchBar from "./SearchBar";
import Brand from "./Brand";
import DropDownProfile from "./DropDownProfile";
import {Avatar, Button} from "@material-ui/core";
import {ThemeContext} from "../../api/Theme"; // ✅ Подключаем тему


function Navigation() {
    const [isLanguageListOpen, setLangList] = useState(false);
    const [isOpenProfile, setOpenProfile] = useState(false);
    const useStyle = useContext(ThemeContext); // ✅ Используем тему

    const [avatar, setAvatar] = useState(null);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!userId) return;
    
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => {
            setAvatar(data.avatar ? `http://localhost:5000/uploads/${data.avatar}` : null);
        })
        .catch(err => console.error("❌ Ошибка загрузки аватара:", err));
    }, [userId, token]);    

    function handleOpenLanguageList() {
        if (isOpenProfile === true) setOpenProfile(!isOpenProfile);
        setLangList(!isLanguageListOpen);
    }

    function handleOpenProfile() {
        if (isLanguageListOpen === true) setLangList(!isLanguageListOpen);
        setOpenProfile(!isOpenProfile);
    }

    return (
        <nav style={useStyle?.theme?.component || { backgroundColor: "#fff", color: "#000" }}> 
            <Brand />
            <div className={"navigation"}>
            </div>
            <SearchBar />
            <div className={"language"} onClick={handleOpenLanguageList}>
                <Button className={"Dropdown-btn"}
                        endIcon={isLanguageListOpen ? <ExpandMoreIcon/> : <ExpandLessIcon/>}>
                    <div className="wrapper">
                        <p>Music Languages</p>
                    </div>
                </Button>
                {isLanguageListOpen && <DropDownLanguageList />}
            </div>
            <div className="profile" onClick={handleOpenProfile}>
                <Button className={"Dropdown-btn"}
                        startIcon={
                            avatar ? (
                                <Avatar src={avatar} style={{ width: '30px', height: '30px' }} />
                            ) : (
                                <Avatar style={{ width: '30px', height: '30px', padding: '18px' }}>VS</Avatar>
                            )
                        }                        
                        endIcon={isOpenProfile ? <ExpandMoreIcon/> : <ExpandLessIcon/>}>
                </Button>
                {isOpenProfile && <DropDownProfile />}
            </div>
        </nav>
    );
}

export default Navigation;
