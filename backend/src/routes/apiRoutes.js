const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const sketchController = require('../controllers/sketchController');
const gameController = require('../controllers/gameController');
const leaderboardController = require('../controllers/leaderboardController');
const statsController = require('../controllers/statsController');
const wordController = require('../controllers/wordController');

// --- ROTTE PUBBLICHE ---
// Accessibili a tutti gli utenti (anche non registrati)
router.get('/sketches', sketchController.getAllSketches);
router.get('/sketches/:id', sketchController.getSketchById);
router.get('/leaderboards/players', leaderboardController.getBestPlayers);
router.get('/leaderboards/artists', leaderboardController.getBestArtists);

// --- ROTTE PROTETTE ---
// Da qui in poi, il token JWT è obbligatorio
router.use(authMiddleware);

router.post('/sketches', sketchController.createSketch);
router.post('/sketches/:sketchId/guess', gameController.makeGuess);
router.get('/sketches/:sketchId/session', gameController.getSession);
router.get('/stats/me', statsController.getMyStats);
router.get('/words', wordController.getAllWords);

module.exports = router;