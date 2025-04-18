import React, { useContext, useEffect, useState } from "react";
import './css/Home.scss';
import Navigation from "../fragment/Navigation";
import MobileTopNavigation from "../fragment/MobileTopNavigation";
import SideBar from "../fragment/SideBar";
import FooterMusicPlayer from "../fragment/FooterMusicPlayer";
import BottomNavigationMobile from "../fragment/BottomNavigationMobile";
import MusicCardContainer from "../fragment/MusicCardContainer";
import { useSelector } from "react-redux";
import { ThemeContext } from "../../api/Theme";
import Profile from "./Profile";
import AddMusic from "../fragment/AddMusic";
import EditProfile from "../fragment/EditProfile";
import FooterSelectMusic from "../fragment/FooterSelectMusic";
import Search from "./Search";
import Playlist from "../fragment/Playlist";
import PlaylistModal from "../fragment/PlaylistModal";
import { Skeleton } from "@material-ui/lab";
import SellTrack from "./SellTrack";
import Marketplace from "./Marketplace";
import ArtistProfile from "./ArtistProfile";

function getCurrPage(pathName) {
    switch (pathName) {
        case "/home":
            return <MusicCardContainer />;
        case "/home/search":
            return <Search />;
        case "/home/marketplace":
            return <Marketplace />
        case "/home/profile":
            return <Profile />;
        case "/home/add":
            return <AddMusic />;
        case "/home/sell-track":
            return <SellTrack />;
        case "/home/edit-profile":
            return <EditProfile />;
        default:
            if (pathName.startsWith("/home/playlist/")) {
                return <Playlist />;
            }
            if (pathName.startsWith("/home/artist/")) {
                return <ArtistProfile />;
            }            
            return null;
    }
}

function Home() {
    const [screenSize, setScreenSize] = useState(undefined);
    const [currMusic, setCurrMusic] = useState(null);
    const [Page, setCurrPage] = useState(<MusicCardContainer />);
    const [loaded, setLoaded] = useState(false);
    const [tracks, setTracks] = useState([]); // ✅ Сохраняем треки в `state`
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    let pathname = window.location.pathname;

    useEffect(() => {
        setCurrPage(getCurrPage(pathname));
    }, [pathname]);

    useEffect(() => {
        function handleResize() {
            setScreenSize(window.innerWidth);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const useStyle = useContext(ThemeContext);
    const { playing } = useSelector(state => state.musicReducer);

    useEffect(() => {
        setCurrMusic(playing);
    }, [playing]);

    // ✅ Проверяем и сохраняем токен пользователя
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromURL = params.get("token");
        const userIdFromURL = params.get("userId");

        if (tokenFromURL && userIdFromURL) {
            localStorage.setItem("token", tokenFromURL);
            localStorage.setItem("userId", userIdFromURL);
            setTimeout(() => {
                window.history.replaceState({}, document.title, "/home");
            }, 500);
        }

        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "http://localhost:5500/login.html";
            return;
        }

        fetch("http://localhost:5000/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Ошибка авторизации");
            return response.json();
        })
        .then(data => {
            localStorage.setItem("userId", data.id);
            setLoaded(true);
        })
        .catch(error => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href = "http://localhost:5500/login.html";
        });
    }, []);

    // ✅ Загружаем треки с сервера
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:5000/api/tracks", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem("allTracks", JSON.stringify(data));
                setTracks(data);
            }
        })
        .catch(error => console.error("❌ Ошибка загрузки треков:", error));
    }, []);

    if (!loaded) {
        return (
            <div className="Home-skeleton">
                <Skeleton animation={"wave"} variant={"rect"} height={"100vh"} />
            </div>
        );
    }

    return (
        <div style={useStyle.component} className={"home-container"}>
            <>
                {screenSize <= 970 ? <MobileTopNavigation /> : <Navigation />}
                <section className={"home-music-container"}>
                    <div className="sidebar-home">
                        <SideBar tracks={tracks} onAddPlaylist={() => setShowPlaylistModal(true)} />
                    </div>
                    <div className="main-home" style={useStyle.component}>
                        {Page}
                    </div>
                </section>
                
                <React.Fragment>
                    {currMusic ? <FooterMusicPlayer music={currMusic} /> : <FooterSelectMusic />}
                    {screenSize <= 970 && <BottomNavigationMobile />}
                </React.Fragment>

                {showPlaylistModal && (
                    <PlaylistModal 
                        open={showPlaylistModal} 
                        onClose={() => setShowPlaylistModal(false)}
                        tracks={tracks} // ✅ Передаем треки в модалку
                        updatePlaylists={(newPlaylists) => localStorage.setItem("playlists", JSON.stringify(newPlaylists))}
                    />
                )}
            </>
        </div>
    );    
}

export default Home;
