const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sketch = sequelize.define('Sketch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    canvasData: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
});

module.exports = Sketch;