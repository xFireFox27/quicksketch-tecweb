const { Sketch, GameSession } = require('../models');

exports.getMyStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Numero di disegni prodotti
        const sketchesCount = await Sketch.count({ where: { authorId: userId } });

        // Partite vinte (parole indovinate) e perse (parole non indovinate)
        const wonGames = await GameSession.count({ where: { playerId: userId, status: 'won' } });
        const lostGames = await GameSession.count({ where: { playerId: userId, status: 'lost' } });

        // Numero di tentativi totali utilizzati
        const totalAttempts = await GameSession.sum('attemptsCount', { where: { playerId: userId } });

        res.status(200).json({
            drawingsProduced: sketchesCount,
            wordsGuessed: wonGames,
            wordsNotGuessed: lostGames,
            totalAttemptsUsed: totalAttempts || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel calcolo delle statistiche' });
    }
};