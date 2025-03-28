import React, { useState, useEffect } from "react";
import { Modal, Backdrop, Fade, TextField, Button } from "@material-ui/core";
import "../assets/scss/PlaylistModal.scss";

const PlaylistModal = ({ open, onClose, tracks, updatePlaylists, editPlaylist }) => {
    const [name, setName] = useState("");
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [search, setSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editPlaylistId, setEditPlaylistId] = useState(null);

    const userId = localStorage.getItem("userId");

    // ✅ Загружаем плейлисты при открытии
    useEffect(() => {
        if (!userId) return;
        const storedPlaylists = JSON.parse(localStorage.getItem(`playlists_${userId}`)) || [];
        setPlaylists(storedPlaylists);
    }, [userId]);

    // ✅ Заполняем данные при редактировании
    useEffect(() => {
        if (editPlaylist) {
            setEditMode(true);
            setEditPlaylistId(editPlaylist.id);
            setName(editPlaylist.name);
            setSelectedTracks(editPlaylist.tracks || []);
        } else {
            setEditMode(false);
            setEditPlaylistId(null);
            setName("");
            setSelectedTracks([]);
        }
    }, [editPlaylist, open]);

    // 🔎 Фильтрация треков по поиску
    const filteredTracks = tracks.filter(track =>
        track.name.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Переключение выбора треков
    const toggleTrack = (trackId) => {
        setSelectedTracks(prev =>
            prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
        );
    };

    // ✅ Создание нового плейлиста
    const createPlaylist = () => {
        if (!name.trim()) {
            alert("❌ Enter a name for the playlist!");
            return;
        }

        if (!userId) {
            alert("❌ User ID not found!");
            return;
        }

        const newPlaylist = {
            id: Date.now(),
            name,
            tracks: selectedTracks,
        };

        const userPlaylists = JSON.parse(localStorage.getItem(`playlists_${userId}`)) || [];
        const updatedPlaylists = [...userPlaylists, newPlaylist];

        localStorage.setItem(`playlists_${userId}`, JSON.stringify(updatedPlaylists));

        setPlaylists(updatedPlaylists);
        updatePlaylists(updatedPlaylists);
        handleClose();
    };

    // ✅ Обновление существующего плейлиста
    const handleEdit = () => {
        if (!editPlaylistId) return;

        const updatedPlaylists = playlists.map(playlist =>
            playlist.id === editPlaylistId ? { ...playlist, name, tracks: selectedTracks } : playlist
        );

        localStorage.setItem(`playlists_${userId}`, JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
        updatePlaylists(updatedPlaylists);
        handleClose();
    };

    // ✅ Удаление плейлиста
    const deletePlaylist = () => {
        if (!editPlaylistId) return;

        const updatedPlaylists = playlists.filter(playlist => playlist.id !== editPlaylistId);
        localStorage.setItem(`playlists_${userId}`, JSON.stringify(updatedPlaylists));

        setPlaylists(updatedPlaylists);
        updatePlaylists(updatedPlaylists);
        handleClose();
    };

    // ✅ Очистка состояний при закрытии
    const handleClose = () => {
        setName("");
        setSelectedTracks([]);
        setEditMode(false);
        setEditPlaylistId(null);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop}>
            <Fade in={open}>
                <div className="playlist-modal">
                    <h2>{editMode ? "Edit Playlist" : "Create New Playlist"}</h2>

                    <TextField
                        id="playlist-name"
                        name="playlistName"
                        label="Playlist Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />


                    <TextField
                        id="search-tracks"
                        name="searchTracks"
                        label="Search Tracks"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="track-list">
                        {filteredTracks.length > 0 ? (
                            filteredTracks.map(track => (
                                <div
                                    key={track.id}
                                    className={`track-item ${selectedTracks.includes(track.id) ? "selected" : ""}`}
                                    onClick={() => toggleTrack(track.id)}
                                >
                                    {track.name}
                                </div>
                            ))
                        ) : (
                            <p>No tracks found</p>
                        )}
                    </div>

                    <Button  className="create-btn" variant="contained" color="primary" onClick={editMode ? handleEdit : createPlaylist}>
                        {editMode ? "Save Changes" : "Create"}
                    </Button>

                    {editMode && (
                        <Button  className="create-btn" variant="contained" color="secondary" onClick={deletePlaylist} style={{ marginLeft: "10px" }}>
                            Delete
                        </Button>
                    )}
                </div>
            </Fade>
        </Modal>
    );
};

export default PlaylistModal;
