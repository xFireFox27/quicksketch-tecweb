const { User, Sketch, GameSession } = require('../backend/src/models');
async function run() {
    try {
        const users = await User.findAll({
            include: [{
                model: Sketch,
                as: 'sketches',
                include: [{ model: GameSession }] 
            }]
        });
        console.log("Success");
    } catch (e) {
        console.error(e);
    }
}
run();
