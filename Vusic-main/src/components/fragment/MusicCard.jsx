import React, { useState, useEffect, useContext } from 'react';
import '../assets/scss/MusicCard.scss';
import PlayCircleFilledWhiteIcon from "@material-ui/icons/PlayCircleFilledWhite";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { useDispatch } from "react-redux";
import { setCurrentPlaying } from "../../actions/actions";
import Name from "./Name";
import { ThemeContext } from "../../api/Theme"; // ✅ Добавляем тему

function MusicCard({ music }) {
    const dispatch = useDispatch();
    const useStyle = useContext(ThemeContext); // ✅ Получаем текущую тему
    const [liked, setLiked] = useState(false);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) return;
        const storedLikes = JSON.parse(localStorage.getItem(`likedTracks_${userId}`)) || [];
        setLiked(storedLikes.some(track => track.id === music.id));
    }, [music.id, userId]);

    function handlePlay() {
        dispatch(setCurrentPlaying(music));
    }

    const toggleLike = (e) => {
        e.stopPropagation();
        if (!userId) {
            alert("❌ Ошибка: пользователь не найден!");
            return;
        }

        let storedLikes = JSON.parse(localStorage.getItem(`likedTracks_${userId}`)) || [];

        if (liked) {
            storedLikes = storedLikes.filter(track => track.id !== music.id);
        } else {
            storedLikes.push(music);
        }

        localStorage.setItem(`likedTracks_${userId}`, JSON.stringify(storedLikes));
        setLiked(!liked);
    };

    return (
      <div
        className="music-card"
        onClick={handlePlay}
        style={
          useStyle?.theme?.component || {
            backgroundColor: "#f6f6f6",
            color: "#000",
          }
        } // ✅ Добавили fallback, если useStyle не загрузился
      >
        <div className="music-card-cover">
          <img
            src={
              music.img_ipfs
                ? music.img_ipfs.replace("ipfs://", "https://w3s.link/ipfs/")
                : `http://localhost:5000/uploads/${music.img}`
            }
            alt={music.name}
            onError={(e) => {
              console.warn("⛔️ IPFS fallback triggered");
              e.target.src = `http://localhost:5000/uploads/${music.img}`;
            }}
          />

          <div className="play-circle">
            <PlayCircleFilledWhiteIcon />
          </div>
        </div>

        <div className="music-info">
          <div className="music-header">
            <Name
              name={music.name}
              className={"song-name"}
              length={music.name.length}
            />
            <FavoriteIcon
              onClick={toggleLike}
              style={{ color: liked ? "red" : "gray", cursor: "pointer" }}
            />
          </div>
          <Name
            name={music.author_name}
            className={"author-name"}
            length={music.author_name.length}
          />
        </div>
      </div>
    );
}

export default MusicCard;
