import React, { useState, useRef, useEffect } from "react";
import SearchSharpIcon from "@material-ui/icons/SearchSharp";
import CancelIcon from "@material-ui/icons/Cancel";
import '../assets/scss/SearchBar.scss';
import { useDispatch } from "react-redux";
import { setSearch } from "../../actions/actions";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(setSearch(searchQuery.toLowerCase())); // Обновляем Redux на всех страницах
    }, [searchQuery, dispatch]);

    useEffect(() => {
        setSearchQuery(""); // Очистка поиска при переходе на другие страницы
    }, [location.pathname]);

    return (
        <div className="SearchBar">
            <div className="search-container">
                <SearchSharpIcon style={{ color: "grey" }} className="search-icon" fontSize="small" />
                <input
                    id="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a track..."
                    type="text"
                    ref={searchRef}
                />
                {searchQuery && (
                    <CancelIcon
                        style={{ color: "grey", cursor: "pointer" }}
                        className="cancel"
                        fontSize="small"
                        onClick={() => setSearchQuery("")}
                    />
                )}
            </div>
        </div>
    );
};

export default SearchBar;
