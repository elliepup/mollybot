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
        typeOfFish: { type: 'string' },
        weight: { type: 'number' },
        length: { type: 'number' },
        value: { type: 'number' },
        color: { type: 'string' },
        difficulty: { type: 'number' }

      }
    }
  },
  async handler(request, reply) {

    const { userId, typeOfFish, weight, length, value, color, difficulty } = request.body;

    const client = new faunadb.Client({
      secret: process.env.FAUNA_SERVER_SECRET.toString(),
      domain: "db.us.fauna.com"
    });

    const data = {
      originalOwner: Call(Fn("getUser"), userId),
      currentOwner: Call(Fn("getUser"), userId),
      typeOfFish,
      weight,
      length,
      value,
      color,
      difficulty,
      catchDate: faunadb.query.Now()
    }

    try {
      const result = await client.query(
        Create(
          Collection('Fish'),
          { data }
        )
      );
      reply.send(result);
    } catch (error) {
      throw new FaunaError(error);
    }
  }
};