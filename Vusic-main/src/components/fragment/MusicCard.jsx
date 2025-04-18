import React, { useState, useEffect, useContext } from 'react';
import '../assets/scss/MusicCard.scss';
import PlayCircleFilledWhiteIcon from "@material-ui/icons/PlayCircleFilledWhite";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { useDispatch } from "react-redux";
import { setCurrentPlaying } from "../../actions/actions";
import Name from "./Name";
import { ThemeContext } from "../../api/Theme"; // ✅ Добавляем тему
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

function MusicCard({ music, isMarketplace }) {
    const dispatch = useDispatch();
    const useStyle = useContext(ThemeContext); // ✅ Получаем текущую тему
    const [liked, setLiked] = useState(false);
    const userId = localStorage.getItem("userId");
    const history = useHistory();

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
          <p
            className="author-name"
            style={{ color: "#61dafb", cursor: "pointer", marginTop: "5px" }}
            onClick={(e) => {
              e.stopPropagation(); // ⛔ чтобы не сработал `onClick` карточки (play)
              history.push(`/home/artist/${music.owner_id}`);
            }}
          >
            {music.author_name}
          </p>
        </div>
        {isMarketplace && (
          <div className="market-extras-wrapper">
            <div className="market-extras">
              <span className="price">{music.price} ETH</span>
              <Button
                variant="contained"
                size="small"
                className="buy-btn"
                disabled
              >
                Buy
              </Button>
            </div>
          </div>
        )}
      </div>
    );
}

export default MusicCard;
