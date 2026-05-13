const { User } = require('../models'); // Grazie all'index.js, possiamo importare così!
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGICA DI REGISTRAZIONE
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Controllo se l'utente esiste già
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username già in uso' });
        }

        // Creiamo il nuovo utente (la password verrà cifrata in automatico dall'hook nel modello User)
        const newUser = await User.create({ username, password });

        res.status(201).json({
            message: 'Utente registrato con successo',
            user: { id: newUser.id, username: newUser.username }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la registrazione' });
    }
};

// LOGICA DI LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cerchiamo l'utente
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Verifichiamo la password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Password errata' });
        }

        // Generiamo il token JWT (valido per 24 ore)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login effettuato con successo',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
};