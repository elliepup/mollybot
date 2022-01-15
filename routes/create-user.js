const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const q = faunadb.query;

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
      userId,
      balance: 100
    }

    try {
      const result = await client.query(

        //q.Get(q.Match(q.Index('user_by_userId'), userId))
        q.Let({
          match: q.Match(q.Index('user_by_userId'), userId)
        },
          q.If(
            q.Exists(q.Var('match')),
            null,
            q.Create(
              q.Collection('Users'),
              {
                data: {
                  userId,
                  balance: 100
                }
              }
            )
          )
        )
      );
      reply.send(result);
    } catch (error) {
      throw new FaunaError(error);
    }
  }
};