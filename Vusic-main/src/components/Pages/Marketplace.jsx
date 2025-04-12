// src/pages/Marketplace.js
import React, { useEffect, useState } from 'react';
import MusicCard from "../fragment/MusicCard";
import './css/Marketplace.scss';

function Marketplace() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/marketplace/tracks")
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => console.error("❌ Ошибка загрузки маркетплейса:", err));
  }, []);

  return (
    <div className="Marketplace-skeleton">
      <div className="music-grid-container">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <MusicCard key={track.id} music={track} isMarketplace={true} />
          ))          
        ) : (
          <p>Нет доступных треков для покупки</p>
        )}
      </div>
    </div>
  );
  
}

export default Marketplace;
