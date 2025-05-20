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
import { getHSRContract } from "../../web3/contract";
import { ethers } from "ethers";

function MusicCard({ music, isMarketplace, isOwner }) {
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

      const storageKey = `likedTracks_${userId}`;
      let storedLikes = JSON.parse(localStorage.getItem(storageKey)) || [];

      const isAlreadyLiked = storedLikes.some((track) => track.id === music.id);

      if (isAlreadyLiked) {
        // 🔻 Удаляем из localStorage
        storedLikes = storedLikes.filter((track) => track.id !== music.id);

        // 🔻 Отправляем запрос на unlike
        fetch(`http://localhost:5000/api/tracks/${music.id}/unlike`, {
          method: "POST",
        });

        setLiked(false);
      } else {
        // 🔺 Добавляем в localStorage
        storedLikes.push(music);

        // 🔺 Отправляем запрос на like
        fetch(`http://localhost:5000/api/tracks/${music.id}/like`, {
          method: "POST",
        });

        setLiked(true);
      }

      localStorage.setItem(storageKey, JSON.stringify(storedLikes));
    };

    const handleBuy = async (e) => {
      e.stopPropagation();
    
      try {
        const contract = await getHSRContract();

        console.log("📦 Проверяем getSongDetails...");
        const songDetails = await contract.getSongDetails(music.song_id);
        console.log("🧾 Название:", songDetails[0]);
        console.log("👤 Артист:", songDetails[1]);
        console.log("🎵 Жанр:", songDetails[2]);
        console.log("🔐 Хеш:", songDetails[3]);
        console.log("💰 Цена (в wei):", songDetails[4].toString());
        console.log("🧾 Покупок:", songDetails[5]);

    
        const userType = await contract.checkUser();
        const LISTENER_TYPE = 2;
    
        if (userType !== LISTENER_TYPE) {
          console.log("🔁 Регистрируемся как listener...");
          const defaultName = `listener_${window.ethereum.selectedAddress.slice(0, 6)}`;
          const txReg = await contract.addNewListener(defaultName);
          await txReg.wait();
          console.log("✅ Listener зарегистрирован");
        }
    
        const priceInWei = ethers.parseEther(music.price.toString());
    
        const tx = await contract.buySong(music.song_id, {
          value: priceInWei,
        });
    
        await tx.wait();
        alert("✅ Покупка прошла успешно!");
    
        const res = await fetch("http://localhost:5000/api/market/complete-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            song_id: music.song_id,
            new_owner_address: window.ethereum.selectedAddress,
          }),
        });
    
        const result = await res.json();
        if (res.ok) {
          console.log("✅ Сервер подтвердил передачу прав:", result);
        } else {
          console.warn("⚠️ Сервер не смог обновить владельца:", result.message);
        }
      } catch (err) {
        console.error("❌ Ошибка при покупке:", err);
        alert("❌ Покупка не удалась. Проверьте MetaMask или баланс.");
      }
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
            style={{ color: "gray", cursor: "pointer", marginTop: "5px" }}
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
                onClick={handleBuy}
              >
                Buy
              </Button>
            </div>
          </div>
        )}
        {isOwner && (
          <div
            className="track-stats"
            style={{ marginTop: "5px", fontSize: "0.9rem", color: "#666" }}
          >
            <span style={{ marginRight: "10px", marginLeft: "8px" }}>👁 {music.views || 0}</span>
            <span>❤️ {music.likes || 0}</span>
          </div>
        )}
      </div>
    );
}

export default MusicCard;
