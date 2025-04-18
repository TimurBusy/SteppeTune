import React, { useEffect, useState } from 'react';
import "../Pages/css/ArtistProfile.scss";
import { useDispatch } from "react-redux";
import { setCurrentPlaying } from "../../actions/actions";

function ArtistProfile() {
  const id = window.location.pathname.split("/").pop();
  const dispatch = useDispatch();

  console.log("Загрузка профиля артиста ID:", id);

  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // 🔹 Загружаем инфу об артисте
    fetch(`http://localhost:5000/api/users/${id}`)
      .then(res => res.json())
      .then(data => setArtist(data))
      .catch(err => console.error("Ошибка загрузки профиля артиста:", err));

    // 🔹 Загружаем треки через публичный маршрут
    fetch(`http://localhost:5000/api/public/tracks/user/${id}`)
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => console.error("Ошибка загрузки треков артиста:", err));
  }, [id]);

  if (!artist) return <p>Загрузка...</p>;

  return (
    <div className="artist-profile">
      <h2>{artist.name}</h2>
      <img
        src={
          artist.avatar
            ? `http://localhost:5000/uploads/${artist.avatar}`
            : require("../assets/img/avatar2.jpg")
        }
        alt="Avatar"
        style={{ width: "150px", borderRadius: "50%" }}
      />
      <p style={{ marginTop: "10px" }}>
        <strong>Bio:</strong> {artist.bio || "No bio available"}
      </p>

      <h3>Tracks by {artist.name}</h3>
      <div className="track-list">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <div
              key={track.id}
              className="track-list-item"
              onClick={() => dispatch(setCurrentPlaying(track))}
            >
              <img
                className="track-thumbnail"
                src={
                  track.img_ipfs
                    ? track.img_ipfs.replace("ipfs://", "https://w3s.link/ipfs/")
                    : `http://localhost:5000/uploads/${track.img}`
                }
                alt={track.name}
              />
              <div className="track-info">
                <p className="track-title">{track.name}</p>
                <p className="track-author">{track.author_name}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No tracks available.</p>
        )}
      </div>
    </div>
  );
}

export default ArtistProfile;
