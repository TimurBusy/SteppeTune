import React, { useState, useEffect, useRef } from 'react';
import '../assets/scss/EditProfile.scss';
import { Avatar, Button, TextField } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Для глобального поиска

function EditProfile() {
    const history = useHistory();
    const [userName, setUserName] = useState("");
    const [selectedImg, setSelectedImg] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const [myTracks, setMyTracks] = useState([]);
    const [bio, setBio] = useState("");
    const fileRef = useRef(null);
    const [coverImage, setCoverImage] = useState(null);
    const [artistCover, setArtistCover] = useState(null);
    const [instagram, setInstagram] = useState("");
    const [telegram, setTelegram] = useState("");

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const search = useSelector(state => state.musicReducer.search); // ✅ Глобальный поиск

    const defaultAvatar = require("../assets/img/avatar2.jpg");

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => {
            setUserName(data.name);
            setBio(data.bio || "");
            setPreviewImg(data.avatar ? `http://localhost:5000/uploads/${data.avatar}` : defaultAvatar);
            setArtistCover(data.cover || null); // ✅ сюда
            setInstagram(data.instagram || "");
            setTelegram(data.telegram || "");
        })
        .catch(err => console.error("❌ Ошибка загрузки профиля:", err));
    }, [userId, token, defaultAvatar]);

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => setMyTracks(data))
        .catch(err => console.error("❌ Ошибка загрузки треков:", err));
    }, [userId, token]);

    const handleImgSelect = () => fileRef.current.click();

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedImg(file);
            setPreviewImg(URL.createObjectURL(file));
        }
    };

    const saveProfile = async () => {
        const formData = new FormData();
        formData.append("name", userName);
        if (selectedImg) {
            formData.append("avatar", selectedImg);
        }

        if (coverImage) {
          formData.append("cover", coverImage);
        }        

        formData.append("bio", bio);
        formData.append("instagram", instagram);
        formData.append("telegram", telegram);

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert("✅ Profile updated successfully!");
                history.push("/home/profile");
            } else {
                alert("❌ Failed to update profile");
            }
        } catch (error) {
            console.error("❌ Ошибка при обновлении профиля:", error);
            alert("❌ Error updating profile.");
        }
    };

    const filteredTracks = myTracks.filter(track =>
        track.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalFields = 6;
    let filled = 0;

    if (userName) filled++;
    if (bio) filled++;
    if (selectedImg || previewImg) filled++;
    if (artistCover) filled++;
    if (instagram) filled++;
    if (telegram) filled++;

    const completionPercent = Math.round((filled / totalFields) * 100);


    return (
      <div className="edit-profile-wrapper">
        <div className="edit-profile">
          <h2>Edit Profile</h2>
          {previewImg && (
            <Avatar
              src={previewImg}
              style={{ width: "150px", height: "150px", marginBottom: "20px" }}
            />
          )}
          <Button
            variant="contained"
            onClick={handleImgSelect}
            style={{ marginBottom: "20px" }}
          >
            Change Avatar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <TextField
            id="name"
            name="name"
            label="Name"
            variant="outlined"
            fullWidth
            autoComplete="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <TextField
            label="Biography"
            multiline
            rows={4}
            fullWidth
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <div className="social-links">
            <TextField
              label="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              fullWidth
              style={{ marginBottom: "15px" }}
            />
            <TextField
              label="Telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              fullWidth
              style={{ marginBottom: "15px" }}
            />
          </div>
          <Button variant="contained" color="primary" onClick={saveProfile}>
            Save Changes
          </Button>
          <div className="profile-completion">
          <div className="progress-label">
            Profile Completion: {completionPercent}%
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
        </div>

        

        <div className="track-and-cover-column">
          <div className="track-list-edit">
            <h3>My Tracks</h3>
            <div className="track-grid">
              {filteredTracks.length > 0 ? (
                filteredTracks.map((track) => (
                  <div key={track.id} className="track-card">
                    <img
                      className="track-cover"
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

                    <p className="track-name">{track.name}</p>
                    <Button variant="outlined" color="primary" size="small">
                      Edit
                    </Button>
                  </div>
                ))
              ) : (
                <p>No tracks found</p>
              )}
            </div>
          </div>
          <div className="cover-image-section">
            <h3>Header Image</h3>
            <img
              className="cover-preview"
              src={
                coverImage
                  ? URL.createObjectURL(coverImage)
                  : artistCover
                  ? `http://localhost:5000/uploads/${artistCover}`
                  : require("../assets/img/default-cover.jpg")
              }
              alt="Cover"
            />
            <input
              type="file"
              accept="image/*"
              id="cover-upload"
              onChange={(e) => setCoverImage(e.target.files[0])}
              style={{ display: "none" }}
            />
            <label htmlFor="cover-upload" className="upload-cover-btn">
              Change Cover
            </label>
          </div>
        </div>
      </div>
    );
}

export default EditProfile;
