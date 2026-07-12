const { Sketch, User, Word } = require('../models');

exports.createSketch = async (req, res) => {
    try {
        const { canvasData, wordId } = req.body;
        const authorId = req.user.id;

        const newSketch = await Sketch.create({
            canvasData,
            wordId,
            authorId
        });

        res.status(201).json({ message: 'Disegno pubblicato con successo!', sketch: newSketch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nella creazione del disegno' });
    }
};

exports.getAllSketches = async (req, res) => {
    try {
        // Tutti possono vedere la raccolta degli sketch 
        const sketches = await Sketch.findAll({
            include: [
                { model: User, as: 'author', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(sketches);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei disegni' });
    }
};

exports.getSketchById = async (req, res) => {
    try {
        const { id } = req.params;
        const sketch = await Sketch.findByPk(id, {
            include: [
                { model: User, as: 'author', attributes: ['username'] }
            ]
        });

        if (!sketch) {
            return res.status(404).json({ error: 'Disegno non trovato' });
        }

        res.status(200).json(sketch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero del disegno' });
    }
};