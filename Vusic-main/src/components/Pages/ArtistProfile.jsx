import React, { useEffect, useState } from 'react';
import "../Pages/css/ArtistProfile.scss";
import { useDispatch } from "react-redux";
import { setCurrentPlaying } from "../../actions/actions";
import instagramIcon from "../assets/img/instagram.svg";
import telegramIcon from "../assets/img/telegram.svg";
import emailIcon from "../assets/img/email.svg"

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
      <div className="artist-header-with-cover">
        <img
          className="artist-cover-bg"
          src={
            artist.cover
              ? `http://localhost:5000/uploads/${artist.cover}`
              : require("../assets/img/default-cover.jpg")
          }
          alt="Cover"
        />
        <div className="artist-header-content">
          <img
            className="artist-avatar"
            src={
              artist.avatar
                ? `http://localhost:5000/uploads/${artist.avatar}`
                : require("../assets/img/avatar2.jpg")
            }
            alt="Avatar"
          />
          <div className="artist-meta">
            <h2>{artist.name}</h2>
            <p className="artist-bio">{artist.bio || "No bio available"}</p>
          </div>
          <div className="artist-socials">
            {artist.instagram && (
              <a
                href={artist.instagram}
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <img
                  src={instagramIcon}
                  alt="Instagram"
                  className="social-icon"
                />
                Instagram
              </a>
            )}
            {artist.telegram && (
              <a
                href={artist.telegram}
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <img
                  src={telegramIcon}
                  alt="Telegram"
                  className="social-icon"
                />
                Telegram
              </a>
            )}
            {artist.email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${artist.email}`}
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <img
                  src={emailIcon}
                  alt="Email"
                  className="social-icon"
                />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      <h3 className="tracks-title">Tracks by {artist.name}</h3>
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
                    ? track.img_ipfs.replace(
                        "ipfs://",
                        "https://w3s.link/ipfs/"
                      )
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
