const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sketch = sequelize.define('Sketch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    canvasData: {
        type: DataTypes.TEXT, // Usiamo TEXT per supportare Base64 o JSON vettoriale lunghi
        allowNull: false
    }
}, {
    timestamps: true, // Questo genera automaticamente 'createdAt' e 'updatedAt'
});

module.exports = Sketch;