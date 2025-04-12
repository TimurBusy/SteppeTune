// src/pages/SellTrack.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardMedia,
  CardContent,
  Typography
} from "@material-ui/core";
import './css/SellTrack.scss';
import { IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";


function SellTrack() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [price, setPrice] = useState("");
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark-theme'));
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [newPrice, setNewPrice] = useState("");


useEffect(() => {
  const observer = new MutationObserver(() => {
    setIsDark(document.body.classList.contains('dark-theme'));
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  return () => observer.disconnect();
}, []);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => console.error("❌ Ошибка загрузки треков:", err));
  }, [userId]);

  const handleSell = () => {
    if (!selectedTrackId || !price) {
      alert("❗ Выберите трек и укажите цену");
      return;
    }

    fetch("http://localhost:5000/api/market/sell", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        track_id: selectedTrackId,
        price
      })
    })
      .then(res => res.json())
      .then(data => {
        alert("✅ Трек выставлен на продажу!");
        setSelectedTrackId("");
        setPrice("");
        return fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => {
        console.error("❌ Ошибка при продаже:", err);
        alert("❌ Ошибка при продаже трека");
      });
  };

  const saleTracks = tracks.filter(t => t.is_for_sale);
  const handleCancelEdit = () => {
    setEditingTrackId(null);
    setNewPrice("");
  };
  
  const handleUpdatePrice = (trackId) => {
    fetch(`http://localhost:5000/api/market/sell`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ track_id: trackId, price: newPrice })
    })
      .then(res => res.json())
      .then(() => {
        alert("✅ Цена обновлена");
        handleCancelEdit();
        return fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => {
        console.error("❌ Ошибка при обновлении:", err);
        alert("❌ Ошибка обновления");
      });
  };
  
  const handleRemoveFromSale = (trackId) => {
    fetch(`http://localhost:5000/api/market/remove`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ track_id: trackId })
    })
      .then(res => res.json())
      .then(() => {
        alert("✅ Трек снят с продажи");
        return fetch(`http://localhost:5000/api/tracks/user/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => {
        console.error("❌ Ошибка при снятии:", err);
        alert("❌ Ошибка");
      });
  };  

  return (
    <div className="sell-track-wrapper">
      <div className="sell-track-form">
        <h2>Put the track up for sale</h2>

        <FormControl fullWidth>
          <InputLabel>Select track</InputLabel>
          <Select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            MenuProps={{
              getContentAnchorEl: null,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              PaperProps: {
                style: {
                  backgroundColor: isDark ? "#2c2f36" : "#ffffff",
                  color: isDark ? "#eee" : "#111",
                  borderRadius: 10,
                  boxShadow: isDark
                    ? "0 4px 20px rgba(0,0,0,0.6)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                },
              },
            }}
          >
            {tracks
              .filter((track) => !track.is_for_sale)
              .map((track) => (
                <MenuItem key={track.id} value={track.id}>
                  {track.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="number"
          label="Price (in ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Button variant="contained" color="primary" onClick={handleSell}>
          Sell ​​Track
        </Button>
      </div>

      {saleTracks.length > 0 && (
        <div className="sell-track-list-section">
          <h3>Tracks for sale</h3>
          <div className="track-sale-list">
            {saleTracks.map((track) => (
              <Card key={track.id} className="track-sale-card">
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    track.img_ipfs
                      ? track.img_ipfs.replace(
                          "ipfs://",
                          "https://w3s.link/ipfs/"
                        )
                      : `http://localhost:5000/uploads/${track.img}`
                  }
                  alt={track.name}
                />
                <CardContent style={{ textAlign: "center" }}>
                  <Typography variant="h6">{track.name}</Typography>

                  {editingTrackId === track.id ? (
                    <>
                      <TextField
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        label="New Price"
                        type="number"
                        size="small"
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdatePrice(track.id)}
                        style={{ marginTop: 8 }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        size="small"
                        style={{ marginTop: 8 }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Price: {track.price} ETH
                      </Typography>

                      <div style={{ marginTop: 8 }}>
                        <IconButton
                          onClick={() => {
                            setEditingTrackId(track.id);
                            setNewPrice(track.price);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => handleRemoveFromSale(track.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );  
}

export default SellTrack;
