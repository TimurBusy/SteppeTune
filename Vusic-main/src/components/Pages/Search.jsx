import React, { useEffect, useState } from 'react';
import './css/Search.scss';
import Container from "../fragment/Container";
import { useSelector } from "react-redux";
import MusicCard from "../fragment/MusicCard";
import SearchMusic from "../assets/img/searchMusic.svg";
import SearchMusicMp3 from "../assets/img/searchMusicMp3.svg";
import SearchMusicDisc from "../assets/img/searchMusicDisc.svg";
import ArrowUp from '../assets/img/left.svg';

const Search = () => {
    const { search } = useSelector(state => state.musicReducer);
    const [tracks, setTracks] = useState([]);
    const [searchResult, setSearchResult] = useState([]);

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
            .then(data => {
                setTracks(data);
                setSearchResult(data); // Показываем всё сначала
            })
            .catch(error => console.error("❌ Ошибка загрузки треков:", error));
    }, []);

    useEffect(() => {
        if (!search) {
            setSearchResult(tracks); // Если строка пустая, показываем все треки
        } else {
            setSearchResult(tracks.filter(track =>
                track.name.toLowerCase().includes(search.toLowerCase()) ||
                track.author_name.toLowerCase().includes(search.toLowerCase()) ||
                (track.lang && track.lang.toLowerCase().includes(search.toLowerCase()))
            ));
        }
    }, [search, tracks]);

    return (
        <Container>
            {searchResult.length === 0 ? (
                <div className="Search">
                    <div className="Search-img">
                        <img className="Rotate-img" src={SearchMusicDisc} alt="search-music-icon" />
                        <img src={SearchMusicMp3} alt="search-music-icon" />
                        <img src={SearchMusic} alt="search-music-icon" />
                        <img className="Arrow" src={ArrowUp} alt="" />
                    </div>
                </div>
            ) : (
                <div className="Search-result">
                    {searchResult.map(track => (
                        <MusicCard key={track.id} music={track} />
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Search;
