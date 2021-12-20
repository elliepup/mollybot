const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const { Match, Index, Get} = faunadb.query;

module.exports = {
  config: {
    isPrivate: true
  },
  schema: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
        }
      }
    }
  },
  async handler (request, reply) {

    const userId = request.params.userId;

    const client = new faunadb.Client({
      secret: request.faunaSecret,
      domain: "db.us.fauna.com"
    });
    try {
        const result = await client.query(
            Get(Match(Index('user_by_userId'), userId))
        );
        reply.send(result);

    } catch (error) {
        throw new FaunaError(error);
    }
  }
};