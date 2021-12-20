const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const { Create, Collection } = faunadb.query;

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

    try {
      const result = await client.query(
        Create(
          Collection('Users'),
          {
            data: {
              userId,
              balance: 100
            },
          }
        )
      );
      reply.send(result);
    } catch (error) {
      throw new FaunaError(error);
    }
  }
};