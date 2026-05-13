const User = require('./User');
const Word = require('./Word');
const Sketch = require('./Sketch');
const GameSession = require('./GameSession');

// --- ASSOCIAZIONI ---

// Un Utente può creare molti Sketch (L'utente è l'autore)
User.hasMany(Sketch, { foreignKey: 'authorId', as: 'sketches' });
Sketch.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Una Parola può essere usata in molti Sketch
Word.hasMany(Sketch, { foreignKey: 'wordId' });
Sketch.belongsTo(Word, { foreignKey: 'wordId', as: 'word' });

// Un Utente può fare molte partite (GameSessions)
User.hasMany(GameSession, { foreignKey: 'playerId' });
GameSession.belongsTo(User, { foreignKey: 'playerId', as: 'player' });

// Ogni Sketch può avere molte giocate (da utenti diversi)
Sketch.hasMany(GameSession, { foreignKey: 'sketchId' });
GameSession.belongsTo(Sketch, { foreignKey: 'sketchId', as: 'sketch' });

// Assicuriamoci che un utente possa avere solo una GameSession per ogni Sketch
// (Così se perde, non può creare una nuova sessione per ritentare)
User.belongsToMany(Sketch, { through: GameSession, foreignKey: 'playerId', otherKey: 'sketchId' });

module.exports = {
  User,
  Word,
  Sketch,
  GameSession
};