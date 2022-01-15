const fastify = require('fastify')({ logger: false });

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setActivity("to the sound of disappointment.", { type: "LISTENING" })

        faunaInit();
    }
}


const faunaInit = () => {
    fastify.post('/users', require('../routes/create-user.js'));
    fastify.post('/fish', require('../routes/create-fish.js'));
    fastify.post('/econprofile', require('../routes/create-econprofile.js'));
    fastify.post('/fishingprofile', require('../routes/create-fishingprofile.js'));
    fastify.post('/users/update/:userId', require('../routes/update-balance.js'));
    fastify.post('/econprofile/update/:userId', require('../routes/update-econAttribute.js'))
    fastify.get('/users/:userId', require('../routes/get-user.js'));
    fastify.get('/fish/:userId', require('../routes/get-fish.js'));
    fastify.get('/econprofile/:userId', require('../routes/get-econprofile.js'));
    fastify.get('/leaderboard', require('../routes/get-leaderboard.js'));
    
    

    fastify.addHook('onRequest', async (request, reply) => {
        if (!reply.context.config.isPrivate) return;
        const faunaSecret = request.headers['fauna-secret'];
        if (!faunaSecret) {
            reply.status(401).send();
            return;
        }
        request.faunaSecret = faunaSecret;
    });

    fastify.decorateRequest('faunaSecret', '');

    async function start() {
        try {
            await fastify.listen(3000);
            fastify.log.info(`server listening on ${fastify.server.address().port}`);
        } catch (err) {
            fastify.log.error(err)
            process.exit(1);
        }
    };
    start();
}