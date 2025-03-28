const { DataTypes } = require("sequelize");
const sequelize = require("../index");

const Track = sequelize.define("Track", {
    name: { type: DataTypes.STRING, allowNull: false },
    author_name: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: false },
    lang: { type: DataTypes.STRING, defaultValue: "ENGLISH" },
    timesPlayed: { type: DataTypes.INTEGER, defaultValue: 0 },
    type: { type: DataTypes.STRING, defaultValue: "electronic" },
    musicName: { type: DataTypes.STRING, allowNull: false },
    owner_id: { type: DataTypes.INTEGER, allowNull: false }
});

sequelize.sync()
    .then(() => console.log("✅ Track table created"))
    .catch(err => console.error("❌ Error creating table:", err));

module.exports = Track;
