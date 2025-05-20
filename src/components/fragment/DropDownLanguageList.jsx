import React, { useContext, useState } from "react";
import '../assets/scss/DropDown.scss';
import Button from "@material-ui/core/Button";
import LangList from "./LangList";
import { ThemeContext } from "../../api/Theme";
import { useDispatch } from "react-redux";
import { setMusicLang } from "../../actions/actions";

const DropDownLanguageList = () => {
    const { theme } = useContext(ThemeContext); 

    const listOfLanguage = ["Any", "English", "Russian"];

    const [selectedList, setSelectedList] = useState({
        "Any": true,  // ✅ "Any" включен по умолчанию
        "English": false,
        "Russian": false,
    });

    const handleSelected = (val) => {
        setSelectedList(prevState => {
            let newState = { ...prevState };

            if (val === "Any") {
                // ✅ Если выбрали "Any", сбрасываем все языки
                newState = { "Any": true, "English": false, "Russian": false };
            } else {
                // ✅ Если выбираем конкретный язык, "Any" выключается
                newState["Any"] = false;
                newState[val] = !prevState[val];
            }

            return newState;
        });
    };

    const dispatch = useDispatch();
    const handleLangSelect = (e) => {
        e.preventDefault();
        let selectedLanguages = Object.keys(selectedList).filter(lang => selectedList[lang]);

        if (selectedLanguages.length === 0) {
            alert("❌ Please select at least one language!");
            return;
        }

        dispatch(setMusicLang(selectedLanguages.map(lang => lang.toUpperCase())));  
    };

    return (
        <div style={theme.component} className="dropdown">
            <div className="dropdown-head">
                <p>Pick the language you want to listen to</p>
            </div>
            <div className={"lang-list"}>
                {listOfLanguage.map((item) => (
                    <LangList 
                        key={item} 
                        item={item} 
                        isSelected={selectedList[item]}  
                        onClick={handleSelected}  
                    />
                ))}
            </div>
            <div className={"button-div"}>
                <Button 
                    onClick={handleLangSelect} 
                    style={{
                        backgroundColor: "var(--dropdown-button-bg)", 
                        color: "var(--dropdown-button-text)",
                        border: "1px solid var(--border-color)",
                        transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out"
                    }}
                >
                    Update
                </Button>
            </div>
        </div>
    );
};

export default DropDownLanguageList;
