const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const sketchController = require('../controllers/sketchController');
const gameController = require('../controllers/gameController');
const leaderboardController = require('../controllers/leaderboardController');
const statsController = require('../controllers/statsController');

// --- ROTTE PUBBLICHE ---
// Accessibili a tutti gli utenti (anche non registrati)
router.get('/sketches', sketchController.getAllSketches);
router.get('/leaderboards/players', leaderboardController.getBestPlayers);
router.get('/leaderboards/artists', leaderboardController.getBestArtists);

// --- ROTTE PROTETTE ---
// Da qui in poi, il token JWT è obbligatorio
router.use(authMiddleware);

router.post('/sketches', sketchController.createSketch);
router.post('/sketches/:sketchId/guess', gameController.makeGuess);
router.get('/stats/me', statsController.getMyStats);

module.exports = router;