const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GameSession = sequelize.define('GameSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attemptsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    guessedWords: {
        type: DataTypes.ARRAY(DataTypes.STRING), // Memorizziamo le stringhe tentate
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('playing', 'won', 'lost'),
        defaultValue: 'playing',
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = GameSession;