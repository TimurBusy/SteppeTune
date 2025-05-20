import React, { useEffect, useState } from "react";
import './App.scss';
import Home from "../components/Pages/Home";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from "../components/Pages/Login";
import Playlist from "../components/fragment/Playlist";
import { ThemeContext, themes } from "../api/Theme";
import ArtistProfile from "../components/Pages/ArtistProfile";

const App = () => {

    // 🌙 Темная/светлая тема
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") === "dark" ? themes.dark : themes.light;
    });

    useEffect(() => {
        localStorage.setItem("theme", theme === themes.dark ? "dark" : "light");
        document.body.classList.toggle("dark-theme", theme === themes.dark);
        document.body.classList.toggle("light-theme", theme !== themes.dark);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Router>
                <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/home" component={Home} />
                    <Route path="/home/playlist/:id" component={Playlist} />
                    <Route path="/artist/:id" element={<ArtistProfile />} />
                </Switch>
            </Router>
        </ThemeContext.Provider>
    );
}

export default App;
