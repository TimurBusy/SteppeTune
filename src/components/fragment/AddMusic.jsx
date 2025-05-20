import React, { useContext, useRef, useState } from 'react';
import '../assets/scss/AddMusic.scss';
import { Add, Image, MusicNoteTwoTone } from "@material-ui/icons";
import { Button } from "@material-ui/core";
import { ThemeContext } from "../../api/Theme";

function AddMusic() {
    const useStyle = useContext(ThemeContext);
    const fileRefImg = useRef(null);
    const fileRefAudio = useRef(null);
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const [previewAudio, setPreviewAudio] = useState(null);
    const [trackName, setTrackName] = useState("");
    const [artistName, setArtistName] = useState("");
    const [language, setLanguage] = useState("ENGLISH");

    const userId = localStorage.getItem("userId");
    console.log("📌 userId из localStorage:", userId);

    const handleImgSelect = () => fileRefImg.current.click();
    const handleAudioSelect = () => fileRefAudio.current.click();

    const handleFileChange = (e, type) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];

            if (type === "image") {
                setSelectedImg(file);
                setPreviewImg(URL.createObjectURL(file));
            } else {
                setSelectedAudio(file);
                setPreviewAudio(URL.createObjectURL(file));
            }
        }
    };

    const addNewTrack = async () => {
        if (!selectedImg || !selectedAudio || !trackName || !artistName || !userId) {
            alert("❗ Please fill all fields");
            return;
        }

        const formData = new FormData();
        formData.append("img", selectedImg);
        formData.append("musicName", selectedAudio);
        formData.append("name", trackName);
        formData.append("author_name", artistName);
        formData.append("lang", language);
        formData.append("timesPlayed", 0);
        formData.append("type", "electronic");
        formData.append("owner_id", userId);

        console.log("📤 Отправка данных на сервер:", Object.fromEntries(formData.entries()));

        try {
            const response = await fetch("http://localhost:5000/api/tracks", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Track added successfully!");
                // Очистка полей после загрузки
                setSelectedImg(null);
                setSelectedAudio(null);
                setPreviewImg(null);
                setPreviewAudio(null);
                setTrackName("");
                setArtistName("");
            } else {
                alert("❌ Failed to add track: " + result.message);
            }
        } catch (error) {
            console.error("❌ Ошибка при загрузке трека:", error);
            alert("❌ Error uploading track.");
        }
    };

    return (
        <form style={useStyle.component} className={"AddMusic"}>
            <div className="add-music-sub-container">
                <div className="d1">
                    <Button onClick={handleImgSelect} style={{ backgroundColor: useStyle.subTheme, width: "200px", height: "200px" }} variant="contained">
                        <Image titleAccess="Select a music cover" style={{ color: "#f0f0f0", width: "150px", height: "150px" }} />
                    </Button>
                    <input 
                        ref={fileRefImg} 
                        id="trackImage" 
                        name="img" 
                        accept="image/*" 
                        type="file" 
                        hidden 
                        onChange={(e) => handleFileChange(e, "image")} 
                    />
                    {previewImg ? <img src={previewImg} alt="Preview" width="150px" height="150px" /> : <p>No image selected</p>}

                    <Button onClick={handleAudioSelect} style={{ backgroundColor: useStyle.subTheme, width: "200px", height: "200px" }} variant="contained">
                        <MusicNoteTwoTone titleAccess="Select a music file" style={{ color: "#f0f0f0", width: "150px", height: "150px" }} />
                    </Button>
                    <input 
                        ref={fileRefAudio} 
                        id="trackAudio" 
                        name="musicName" 
                        accept="audio/*" 
                        type="file" 
                        hidden 
                        onChange={(e) => handleFileChange(e, "audio")} 
                    />
                    {previewAudio ? <audio controls><source src={previewAudio} type="audio/mpeg" /></audio> : <p>No audio selected</p>}

                    <select 
                        name="language" 
                        id="trackLanguage" 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="ENGLISH">English</option>
                        <option value="RUSSIAN">Russian</option>
                    </select>
                </div>

                <div className="d2">
                    <div>
                        <input 
                            type="text" 
                            id="trackName" 
                            name="trackName" 
                            placeholder="Track Name" 
                            value={trackName} 
                            onChange={(e) => setTrackName(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            id="artistName" 
                            name="artistName" 
                            placeholder="Artist Name" 
                            value={artistName} 
                            onChange={(e) => setArtistName(e.target.value)} 
                        />
                        <Button onClick={addNewTrack} style={{ backgroundColor: useStyle.theme }} variant="contained" endIcon={<Add />}>
                            Add
                        </Button>
                    </div>
                    <div className={"preview"}>
                        <h3>Preview</h3>
                        <p>Music Cover: {selectedImg ? selectedImg.name : "No image selected"}</p>
                        <p>Music File: {selectedAudio ? selectedAudio.name : "No audio selected"}</p>
                        <p>Music Name: {trackName || "No name"}</p>
                        <p>Artist Name: {artistName || "No artist"}</p>
                        <p>Language: {language}</p>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddMusic;
