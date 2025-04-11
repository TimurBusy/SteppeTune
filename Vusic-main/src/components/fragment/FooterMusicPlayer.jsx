import React, { useContext, useEffect, useRef, useState } from "react";
import '../assets/scss/FooterPlayer.scss';
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import Slider from "@material-ui/core/Slider";
import { Avatar, Modal, Backdrop, Fade } from "@material-ui/core";
import ControlsToggleButton from "./ControlsToggleButton";
import Name from "./Name";
import { ThemeContext } from "../../api/Theme";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";

function FooterMusicPlayer() {
    const useStyle = useContext(ThemeContext);
    const audioElement = useRef();
    const { playing } = useSelector(state => state.musicReducer);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isRepeat, setRepeat] = useState(false);
    const [isVolumeMuted, setVolumeMuted] = useState(false);
    const [volume, setVolume] = useState(50);
    const [duration, setDuration] = useState(0);
    const [currTime, setCurrTime] = useState(0);
    const [open, setOpen] = useState(false);

    const pointer = { cursor: "pointer", color: useStyle.theme };

    useEffect(() => {
      async function loadAndPlayAudio() {
        if (!playing || !playing.musicname) return;

        const ipfsUrl = playing.music_ipfs
          ? playing.music_ipfs.replace("ipfs://", "https://w3s.link/ipfs/")
          : null;
        const localUrl = `http://localhost:5000/uploads/${playing.musicname}`;
        const audioUrl = ipfsUrl || localUrl;

        const fileExt = (audioUrl.split('.').pop() || '').toLowerCase();
        const mimeType = fileExt === 'mp3' ? 'audio/mpeg' :
                         fileExt === 'wav' ? 'audio/wav' : 'audio/*';

        console.log("🔗 Загружаем с:", audioUrl);

        const audio = audioElement.current;
        if (!audio) return;

        const source = audio.querySelector("source");
        if (source) {
          source.src = audioUrl;
          source.type = mimeType;
        } else {
          audio.src = audioUrl;
          audio.type = mimeType;
        }

        try {
          audio.pause();
          audio.load();
          await audio.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      }

      loadAndPlayAudio();
    }, [playing]);

    useEffect(() => {
        if (!audioElement.current) return;

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
    }, [isRepeat, volume, isVolumeMuted]);

    const togglePlayPause = () => {
        const audio = audioElement.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const handleSeekChange = (e, newValue) => {
        const audio = audioElement.current;
        if (audio) {
            const newTime = (newValue * duration) / 100;
            audio.currentTime = newTime;
        }
    };

    const handleVolumeChange = (e, newValue) => {
        setVolume(newValue);
    };

    const formatTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
      <>
        <div style={useStyle.component} className={"footer-player"}>
          <audio ref={audioElement} preload="metadata">
            <source src="" type="" />
          </audio>

          <div className="playback">
            <Slider
              style={{ color: useStyle.theme }}
              className={"playback-completed"}
              value={(currTime / duration) * 100 || 0}
              onChange={handleSeekChange}
            />
          </div>

          <Button
            onClick={() => setOpen(true)}
            startIcon={
              <Avatar
                variant="square"
                src={
                  playing?.img_ipfs
                    ? playing.img_ipfs.replace("ipfs://", "https://w3s.link/ipfs/")
                    : `http://localhost:5000/uploads/${playing?.img}`
                }
                alt={playing?.name}
              />
            }
            className="curr-music-container"
          >
            <div className="curr-music-details">
              <Name name={playing?.name || "No Track"} className={"song-name"} length={playing?.name?.length || 0} />
              <Name name={playing?.author_name || ""} className={"author-name"} length={playing?.author_name?.length || 0} />
            </div>
          </Button>

          <div className="playback-controls">
            <ControlsToggleButton
              style={pointer}
              type={"repeat"}
              defaultIcon={<RepeatIcon fontSize={"large"} />}
              changeIcon={<RepeatOneIcon fontSize={"large"} />}
              onClicked={() => setRepeat(!isRepeat)}
            />
            <ControlsToggleButton
              style={pointer}
              type={"play-pause"}
              defaultIcon={<PlayArrowIcon fontSize={"large"} />}
              changeIcon={<PauseIcon fontSize={"large"} />}
              onClicked={togglePlayPause}
            />
            <ControlsToggleButton
              style={pointer}
              type={"volume"}
              defaultIcon={<VolumeUpIcon />}
              changeIcon={<VolumeOffIcon />}
              onClicked={() => setVolumeMuted(!isVolumeMuted)}
            />
          </div>

          <div className="playback-widgets">
            <p>{formatTime(currTime)} / {formatTime(duration)}</p>
            <Slider
              style={{ color: useStyle.theme }}
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

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
                src={
                  playing?.img_ipfs
                    ? playing.img_ipfs.replace("ipfs://", "https://w3s.link/ipfs/")
                    : `http://localhost:5000/uploads/${playing?.img}`
                }
                alt={playing?.name}
              />
            </div>
          </Fade>
        </Modal>
      </>
    );
}

export default FooterMusicPlayer;
