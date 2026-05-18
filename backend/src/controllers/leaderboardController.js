// src/controllers/leaderboardController.js
const { User, Sketch, GameSession } = require('../models');
const sequelize = require('../config/database');

exports.getBestPlayers = async (req, res) => {
    try {
        // I migliori giocatori sono quelli con il maggior numero di status 'won'
        const bestPlayers = await User.findAll({
            attributes: [
                'id',
                'username',
                // Contiamo quante partite hanno vinto
                [sequelize.literal(`(
          SELECT COUNT(*)
          FROM "GameSessions" AS "GameSession"
          WHERE "GameSession"."playerId" = "User"."id" AND "GameSession"."status" = 'won'
        )`), 'wordsGuessed']
            ],
            order: [[sequelize.literal('"wordsGuessed"'), 'DESC']],
            limit: 10
        });

        res.status(200).json(bestPlayers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero dei migliori giocatori' });
    }
};

exports.getBestArtists = async (req, res) => {
    try {
        // Recuperiamo tutti gli utenti con i loro sketch e le giocate associate a quegli sketch.
        const users = await User.findAll({
            include: [{
                model: Sketch,
                as: 'sketches',
                include: [{ model: GameSession }] 
            }]
        });

        let artistsStats = users.map(user => {
            let totalGuesses = 0;
            let correctGuesses = 0;

            // Analizziamo tutti gli sketch prodotti da questo utente
            user.sketches.forEach(sketch => {
                // La proprietà 'GameSessions' qui dentro contiene l'array di GameSessions associate a questo disegno
                const sessions = sketch.GameSessions || [];
                sessions.forEach(session => {
                    totalGuesses++;
                    if (session.status === 'won') {
                        correctGuesses++;
                    }
                });
            });

            // Calcoliamo la percentuale (se non ci sono tentativi, la percentuale è 0)
            const winPercentage = totalGuesses > 0 ? ((correctGuesses / totalGuesses) * 100).toFixed(2) : 0;

            return {
                id: user.id,
                username: user.username,
                winPercentage: parseFloat(winPercentage),
                totalGuesses
            };
        });

        // Filtriamo chi non ha ricevuto nemmeno un tentativo e ordiniamo per percentuale
        artistsStats = artistsStats
            .filter(artist => artist.totalGuesses > 0)
            .sort((a, b) => b.winPercentage - a.winPercentage)
            .slice(0, 10); // Prendiamo la top 10

        res.status(200).json(artistsStats);
    } catch (error) {
        console.error("ERROR IN ARTISTS:", error);
        res.status(500).json({ error: error.message || 'Errore nel recupero dei migliori disegnatori' });
    }
};