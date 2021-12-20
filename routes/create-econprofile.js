const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const { Create, Collection, Call, Function: Fn } = faunadb.query;

module.exports = {
  schema: {
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
      }
    }
  },
  async handler(request, reply) {

    const { userId } = request.body;

    const client = new faunadb.Client({
        secret: process.env.FAUNA_SERVER_SECRET.toString(),
        domain: "db.us.fauna.com"
    });

    const data = {
      user: Call(Fn("getUser"), userId),
      totalDonated: 0,
      coinsFromTalking: 0,
      coinsFromWorking: 0,
      timesWorked: 0,
      totalCoinflipped: 0,
      winningsFromCoinflips: 0,
      timesCoinflipped: 0,
      coinflipsWon: 0,
      coinflipsLost: 0,
      workCooldown: null,
    }

    try {
      const result = await client.query(
        Create(
          Collection('EconProfile'),
          { data }
        )
      );
      reply.send(result);
    } catch (error) {
      throw new FaunaError(error);
    }
  }
};