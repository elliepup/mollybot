const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const q = faunadb.query;

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
  async handler(request, reply) {

    const userId = request.params.userId;

    const client = new faunadb.Client({
      secret: request.faunaSecret,
      domain: "db.us.fauna.com"
    });
    try {
      const result = await client.query(
        q.Let({
          defaultUser: {
            data: {
              'userId': userId,
              'balance': 100
            },
          }
        },
          q.If(q.Exists(q.Match(q.Index('user_by_userId'), userId)),
            q.Get(q.Match(q.Index('econprofile_by_user'), q.Select('ref', q.Get(q.Match(q.Index('user_by_userId'), userId))))),
            q.Do(
              q.Create(q.Collection('Users'), q.Var('defaultUser')),
              q.Create(q.Collection('FishingProfile'), {
                data: {
                  user: q.Select('ref', q.Get(q.Match(q.Index('user_by_userId'), userId))),
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
              }),
              q.Create(q.Collection('EconProfile'), {
                data: {
                  user: q.Select('ref', q.Get(q.Match(q.Index('user_by_userId'), userId))),
                  totalDonated: 0,
                  coinsFromTalking: 0,
                  coinsFromWorking: 0,
                  timesWorked: 0,
                  totalCoinflipped: 0,
                  winningsFromCoinflips: 0,
                  timesCoinflipped: 0,
                  coinflipsWon: 0,
                  coinflipsLost: 0,
                  workCooldown: 0,
                }
              }),
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