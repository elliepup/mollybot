const faunadb = require('faunadb');
const FaunaError = require('../errors/FaunaError.js');

const q = faunadb.query;

module.exports = {
    schema: {
        body: {
            type: 'object',
            required: ['additionalCoins'],
            properties: {
                additionalCoins: { type: 'number' }
            }
        },
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
        const additionalCoins = request.body;

        const client = new faunadb.Client({
            secret: process.env.FAUNA_SERVER_SECRET.toString(),
            domain: "db.us.fauna.com"
        });

        try {
            const result = await client.query(
                q.Let({
                    match: q.Match(q.Index('user_by_userId'), userId),
                    default: {
                        data: {
                            userId: userId,
                            balance: 100 + additionalCoins.additionalCoins
                        }

                    }
                },
                    q.If(q.Exists(q.Var('match')),
                        q.Update(q.Select('ref', q.Get(q.Var('match'))), {
                            data: {
                                balance: q.Add(q.Select(['data', 'balance'],
                                    q.Get(
                                        (q.Match(q.Index('user_by_userId'), userId))
                                    )
                                ), additionalCoins.additionalCoins
                                )
                            }
                        }),
                        q.Do(
                            q.Create(q.Collection('Users'), q.Var('default')),
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
                            })
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