import React, { useEffect, useState } from 'react';
import './css/Profile.scss';
import { Avatar, Button } from "@material-ui/core";
import MusicCard from "../fragment/MusicCard";
import Container from "../fragment/Container";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Импорт Redux

function Profile() {
    const history = useHistory();
    const [userName, setUserName] = useState("User Profile");
    const [avatar, setAvatar] = useState(null);
    const [myTracks, setMyTracks] = useState([]);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const search = useSelector(state => state.musicReducer.search); // ✅ Глобальный поиск

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
            setAvatar(data.avatar ? `http://localhost:5000/uploads/${data.avatar}` : require("../assets/img/avatar2.jpg"));
        })
        .catch(err => console.error("❌ Ошибка загрузки профиля:", err));
    }, [userId, token]);

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
            return res.json();
        })
        .then(data => setMyTracks(data))
        .catch(err => console.error("❌ Ошибка загрузки треков:", err));
    }, [userId, token]);

    // ✅ Фильтрация по глобальному поиску
    const filteredTracks = myTracks.filter(track =>
        track.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
            <div className="Profile">
                <div className="top-profile">
                    <Avatar src={avatar} style={{ width: "150px", height: "150px" }} />
                    <div className="profile-detail">
                        <h3>{userName}</h3>
                    </div>
                    <Button variant="contained" color="primary" onClick={() => history.push('/home/add')} style={{ marginTop: "20px" }}>
                        Add Track
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => history.push('/home/edit-profile')} style={{ marginTop: "20px", marginLeft: "10px" }}>
                        Edit
                    </Button>
                    <Button variant="contained" color="default" onClick={logout} style={{ marginTop: "20px", marginLeft: "10px" }}>
                        Logout
                    </Button>
                </div>
                <div className="bottom-profile">
                    <h3>My Tracks</h3>
                    <div className="most-played">
                        {filteredTracks.length > 0 ? (
                            filteredTracks.map(track => (
                                <MusicCard key={track.id} music={track} />
                            ))
                        ) : (
                            <p>No tracks found</p>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}

function logout() {
    console.log("🚪 Выход из аккаунта...");
    localStorage.removeItem("userId"); 
    localStorage.removeItem("token"); 
    window.location.href = "http://localhost:5500/login.html";
}

export default Profile;
