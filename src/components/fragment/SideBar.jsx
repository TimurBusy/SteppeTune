import React, { useContext, useState, useEffect } from "react";
import "../assets/scss/SideBar.scss";
import SideBarOptions from "./SideBarOptions";
import { ThemeContext, themes } from "../../api/Theme";
import { HomeOutlined, PlaylistPlay, SearchOutlined, Settings, Brightness4, PlaylistAdd, Edit, Delete } from "@material-ui/icons";
import { Button, IconButton } from "@material-ui/core";
import PlaylistModal from "./PlaylistModal";
import { Storefront } from "@material-ui/icons";

function SideBar({ tracks }) { 
    const { theme, setTheme } = useContext(ThemeContext);
    const useStyle = theme;
    const [open, setOpen] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [editPlaylist, setEditPlaylist] = useState(null); // 🔥 Хранение редактируемого плейлиста

    const userId = localStorage.getItem("userId"); // 🔥 Получаем ID пользователя

    useEffect(() => {
        if (!userId) return;
        const storedPlaylists = JSON.parse(localStorage.getItem(`playlists_${userId}`)) || [];
        setPlaylists(storedPlaylists);
    }, [userId]);

    const updatePlaylists = (newPlaylists) => {
        if (!userId) return;
        setPlaylists(newPlaylists);
        localStorage.setItem(`playlists_${userId}`, JSON.stringify(newPlaylists));
    };

    const toggleTheme = () => {
        setTheme(theme === themes.light ? themes.dark : themes.light);
    };

    // 🔥 Функция удаления плейлиста
    const deletePlaylist = (playlistId) => {
        const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
        updatePlaylists(updatedPlaylists);
    };

    return (
        <aside style={useStyle.component} className={"aside-bar"}>
            <div className="aside-bar-container">
                <p className={"p1"}><span>LIBRARY</span></p>
                <SideBarOptions className={"lib-sub"} Icon={HomeOutlined} href={"/home"} title={"Home"} />
                <SideBarOptions className={"lib-sub"} Icon={SearchOutlined} href={"/home/search"} title={"Search"} />
                <SideBarOptions className={"lib-sub"} Icon={Storefront} href={"/home/marketplace"} title={"Marketplace"} />
            </div>

            <div className="aside-bar-container settings">
                <p className={"p1"}><span>SETTINGS</span></p>
                <SideBarOptions className={"lib-sub"} Icon={Settings} href={"/home/settings"} title={"Account Settings"} />
                <Button 
                    variant="contained" 
                    onClick={toggleTheme} 
                    startIcon={<Brightness4 />} 
                    className="theme-toggle-btn"
                >
                    {theme === themes.light ? "Dark Mode" : "Light Mode"}
                </Button>
            </div>

            <div className="aside-bar-container playlist">
                <p className={"p1"}><span>MY PLAYLIST</span></p>
                
                {/* ✅ Правильная ссылка для "Selected" */}
                <SideBarOptions 
                    className={"lib-sub"} 
                    Icon={PlaylistPlay} 
                    href={"/home/playlist/selected"}  
                    title={"Selected"} 
                />
                
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<PlaylistAdd />} 
                    onClick={() => {
                        setEditPlaylist(null);
                        setOpen(true);
                    }}
                    className="add-playlist-btn"
                >
                    Add Playlist
                </Button>

                {/* ✅ Теперь создаваемые плейлисты можно редактировать и удалять */}
                {playlists.map(playlist => (
                    <div key={playlist.id} className="playlist-item-row">
                        <SideBarOptions 
                            className={"lib-sub"} 
                            Icon={PlaylistPlay} 
                            href={`/home/playlist/${playlist.id}`}  
                            title={playlist.name} 
                        />
                        <div className="playlist-icons">
                            <IconButton onClick={() => { setEditPlaylist(playlist); setOpen(true); }} size="small">
                                <Edit fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => deletePlaylist(playlist.id)} size="small">
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                ))}

            </div>

            <PlaylistModal 
                open={open} 
                onClose={() => setOpen(false)} 
                tracks={tracks} 
                updatePlaylists={updatePlaylists} 
                editPlaylist={editPlaylist} // ✅ Передаем плейлист для редактирования
            />
        </aside>
    );
}

export default SideBar;
