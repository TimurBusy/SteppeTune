import React, { useEffect, useState } from "react";
import '../assets/scss/MusicCardContainer.scss';
import MusicCard from "./MusicCard";
import Container from "./Container";
import { useSelector } from "react-redux";

function MusicCardContainer() {
    const [tracks, setTracks] = useState([]);
    const { search, musicLang } = useSelector(state => state.musicReducer);  

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.warn("🔴 Нет токена, не загружаем треки");
            return;
        }

        fetch("http://localhost:5000/api/tracks", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => setTracks(data))
        .catch(error => console.error("❌ Ошибка загрузки треков:", error));
    }, []);

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = search
            ? track.name.toLowerCase().includes(search.toLowerCase()) ||
              track.author_name.toLowerCase().includes(search.toLowerCase())
            : true;

        // ✅ Если "Any" выбран, показываем все треки
        const matchesLang = musicLang.length === 0 || musicLang.includes("ANY") || musicLang.includes(track.lang.toUpperCase());

        return matchesSearch && matchesLang;
    });

    return (
        <Container>
            <div className="music-card-container">
                {filteredTracks.length > 0 ? (
                    filteredTracks.map(item => (
                        <MusicCard key={item.id} music={item} />
                    ))
                ) : (
                    <p>Нет загруженных треков.</p>
                )}
            </div>
        </Container>
    );
}

export default MusicCardContainer;
