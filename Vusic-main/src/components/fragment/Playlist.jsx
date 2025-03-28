import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Импорт Redux
import '../assets/scss/Playlist.scss';
import MusicCard from "./MusicCard";
import Container from "./Container";

const Playlist = () => {
    const location = useLocation();
    const id = location.pathname.split("/").pop();
    const userId = localStorage.getItem("userId");

    const [tracks, setTracks] = useState([]);
    const search = useSelector(state => state.musicReducer.search); // ✅ Получаем глобальный поисковый запрос

    useEffect(() => {
        if (!userId || !id) return;

        if (id === "selected") {
            const storedLikes = JSON.parse(localStorage.getItem(`likedTracks_${userId}`)) || [];
            setTracks(storedLikes);
        } else {
            const userPlaylists = JSON.parse(localStorage.getItem(`playlists_${userId}`)) || [];
            const selectedPlaylist = userPlaylists.find(p => String(p.id) === String(id));

            if (selectedPlaylist) {
                const allTracks = JSON.parse(localStorage.getItem("allTracks")) || [];
                const playlistTracks = allTracks.filter(track => selectedPlaylist.tracks.includes(track.id));
                setTracks(playlistTracks);
            }
        }
    }, [id, userId]);

    // ✅ Фильтрация по глобальному поиску из Redux
    const filteredTracks = tracks.filter(track =>
        track.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
            <div className="Playlist">
                <h3>🎵 {id === "selected" ? "Selected Tracks" : "Playlist"}</h3>

                <div className="Playlist-container">
                    {filteredTracks.length > 0 ? (
                        filteredTracks.map(track => <MusicCard key={track.id} music={track} />)
                    ) : (
                        <p>❌ No tracks found</p>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default Playlist;
