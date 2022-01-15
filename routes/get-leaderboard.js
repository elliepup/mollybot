const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

q = faunadb.query;

module.exports = {
    config: {
        isPrivate: true
    },
    async handler(request, reply) {

        const client = new faunadb.Client({
            secret: request.faunaSecret,
            domain: "db.us.fauna.com"
        });
        try {
            const result = await client.query(
                q.Paginate(q.Match(q.Index('user_sort_by_balance_desc')))
            );
            reply.send(result);

        } catch (error) {
            throw new FaunaError(error);
        }
    }
};