import React, { useContext, useEffect, useRef, useState } from "react";
import '../assets/scss/FooterPlayer.scss';
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import Slider from "@material-ui/core/Slider";
import { Avatar, Modal, Backdrop, Fade } from "@material-ui/core"; // ✅ Импортируем Modal
import ControlsToggleButton from "./ControlsToggleButton";
import Name from "./Name";
import { ThemeContext } from "../../api/Theme";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";

function FooterMusicPlayer() {
    const useStyle = useContext(ThemeContext);
    const audioElement = useRef();
    const { playing } = useSelector(state => state.musicReducer); // ✅ Получаем текущий трек из Redux

    const [isPlaying, setIsPlaying] = useState(false);
    const [isRepeat, setRepeat] = useState(false);
    const [isVolumeMuted, setVolumeMuted] = useState(false);
    const [volume, setVolume] = useState(50);
    const [duration, setDuration] = useState(0);
    const [currTime, setCurrTime] = useState(0);
    
    const [open, setOpen] = useState(false); // ✅ State для модального окна

    const pointer = { cursor: "pointer", color: useStyle.theme };

    useEffect(() => {
        if (playing) {
            console.log("🎵 Текущий трек в Redux:", playing);

            if (!playing.musicname) { 
                console.error("❌ Ошибка: musicname отсутствует в объекте playing");
                return;
            }

            setIsPlaying(true);
            if (audioElement.current) {
                const audioUrl = `http://localhost:5000/uploads/${playing.musicname}`;
                console.log("🎵 Загружаем аудиофайл:", audioUrl);
                audioElement.current.src = audioUrl;
                audioElement.current.play().catch(error => console.error("❌ Ошибка при воспроизведении:", error));
            }
        }
    }, [playing]);

    useEffect(() => {
        if (audioElement.current) {
            audioElement.current.loop = isRepeat;
            audioElement.current.volume = volume / 100;
            audioElement.current.muted = isVolumeMuted;
            
            audioElement.current.onloadedmetadata = () => {
                setDuration(audioElement.current.duration);
            };

            audioElement.current.ontimeupdate = () => {
                setCurrTime(audioElement.current.currentTime);
            };

            audioElement.current.onended = () => {
                setIsPlaying(false);
            };
        }
    }, [isRepeat, volume, isVolumeMuted]);

    function togglePlayPause() {
        if (isPlaying) {
            audioElement.current.pause();
        } else {
            audioElement.current.play();
        }
        setIsPlaying(!isPlaying);
    }

    function handleSeekChange(event, newValue) {
        if (audioElement.current) {
            const newTime = (newValue * duration) / 100;
            audioElement.current.currentTime = newTime;
        }
    }

    function handleVolumeChange(event, newValue) {
        setVolume(newValue);
    }

    function formatTime(secs) {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    return (
        <>
            <div style={useStyle.component} className={"footer-player"}>
                <audio ref={audioElement} preload="metadata" />

                <div className="playback">
                    <Slider
                        style={{ color: useStyle.theme }}
                        className={"playback-completed"}
                        value={(currTime / duration) * 100 || 0}
                        onChange={handleSeekChange}
                    />
                </div>

                {/* ✅ Кликаем по обложке - открываем модальное окно */}
                <Button onClick={() => setOpen(true)} 
                    startIcon={
                        <Avatar variant="square" 
                            src={`http://localhost:5000/uploads/${playing?.img}`} 
                            alt={playing?.name} 
                            style={{ cursor: "pointer" }} 
                        />
                    }
                    className="curr-music-container">
                    <div className="curr-music-details">
                        <Name name={playing?.name || "No Track"} className={"song-name"} length={playing?.name?.length || 0} />
                        <Name name={playing?.author_name || ""} className={"author-name"} length={playing?.author_name?.length || 0} />
                    </div>
                </Button>

                <div className="playback-controls">
                    <ControlsToggleButton style={pointer} type={"repeat"}
                                          defaultIcon={<RepeatIcon fontSize={"large"} />}
                                          changeIcon={<RepeatOneIcon fontSize={"large"} />}
                                          onClicked={() => setRepeat(!isRepeat)} />

                    <ControlsToggleButton style={pointer} type={"play-pause"}
                                          defaultIcon={<PlayArrowIcon fontSize={"large"} />}
                                          changeIcon={<PauseIcon fontSize={"large"} />}
                                          onClicked={togglePlayPause} />

                    <ControlsToggleButton style={pointer} type={"volume"}
                                          defaultIcon={<VolumeUpIcon />}
                                          changeIcon={<VolumeOffIcon />}
                                          onClicked={() => setVolumeMuted(!isVolumeMuted)} />
                </div>

                <div className="playback-widgets">
                    <p>{formatTime(currTime)} / {formatTime(duration)}</p>
                    <Slider style={{ color: useStyle.theme }} value={volume} onChange={handleVolumeChange} />
                </div>
            </div>

            {/* ✅ Модальное окно с увеличенной обложкой */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={open}>
                    <div className="modal-container">
                        <img 
                            src={`http://localhost:5000/uploads/${playing?.img}`} 
                            alt={playing?.name} 
                            className="modal-image"
                        />
                    </div>
                </Fade>
            </Modal>
        </>
    );
}

export default FooterMusicPlayer;
