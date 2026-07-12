const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Cerchiamo il token nell'header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accesso negato. Token mancante.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifichiamo il token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Salviamo i dati dell'utente nella richiesta per usarli nei controller successivi
        req.user = decoded;
        next(); // Passiamo al prossimo controller
    } catch (error) {
        res.status(401).json({ error: 'Token non valido o scaduto.' });
    }
};