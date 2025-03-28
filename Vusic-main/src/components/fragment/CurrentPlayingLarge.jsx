import React, { useEffect, useState } from 'react';
import '../assets/scss/CurrentPlayingLarge.scss';
import { useSelector } from "react-redux";

function CurrentPlayingLarge() {
    const { playing } = useSelector(state => state.musicReducer);
    const [currPlaying, setCurrPlaying] = useState(null);

    useEffect(() => {
        setCurrPlaying(playing);
    }, [playing]);

    if (!currPlaying) return null; // Если трек не играет, скрываем компонент

    return (
        <div className="CurrentPlayingLarge">
            <img className="banner" src={`http://localhost:5000/uploads/${currPlaying.img}`} alt="Track cover" />
            <div className="music-left">
                <div className="wrapper">
                    <img className="music-cover" src={`http://localhost:5000/uploads/${currPlaying.img}`} alt="Track cover" />
                    <div className="detail">
                        <h3>{currPlaying.name}</h3>
                        <p>{currPlaying.author_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CurrentPlayingLarge;
