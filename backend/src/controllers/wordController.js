const { Word } = require('../models');

exports.getAllWords = async (req, res) => {
    try {
        const words = await Word.findAll({
            attributes: ['id', 'testo']
        });

        res.status(200).json(words);
    } catch (error) {
        console.error('Errore nel recupero delle parole:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle parole dal database' });
    }
};