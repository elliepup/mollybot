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
      tierOneBait: 5,
      tierTwoBait: 0,
      tierThreeBait: 0,
      timesFished: 0,
      fishCaught: 0,
      fishSold: 0,
      trashCaught: 0,
      ancientRelicsCaught: 0,
      fishingCooldown: 0,
    }

    try {
      const result = await client.query(
        Create(
          Collection('FishingProfile'),
          { data }
        )
      );
      reply.send(result);
    } catch (error) {
      throw new FaunaError(error);
    }
  }
};