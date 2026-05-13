require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');


require('./models');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Connessione al database stabilita e modelli sincronizzati.');

        app.listen(PORT, () => {
            console.log(`Server in esecuzione sulla porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Impossibile connettersi al database:', error);
    });