import { PrismaClient } from '.prisma/client'
import withPrisma from '../../../core/prismaClient'
import { NextApiRequest, NextApiResponse } from 'next'

const CountryStats = {
    POPULATION: 'population',
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            let { stat, sort, limit: limitStr } = req.query

            try {
                if (!stat || typeof stat !== 'string')
                    throw new Error('Invalid Stat Type')

                let limit: number
                if (limitStr && typeof limitStr === 'string')
                    limit = Number.parseInt(limitStr)

                switch (stat) {
                    case CountryStats.POPULATION: {
                        let countries = await withPrisma(async (client: PrismaClient) => {
                            return await client.country
                                .findMany({
                                    include: {
                                        _count: {
                                            select: {
                                                citizens: true
                                            }
                                        }
                                    },
                                    orderBy: (typeof sort === 'string') ? ({
                                        citizens: {
                                            _count: (sort === 'asc') ? 'asc' : 'desc'
                                        }
                                    }) : undefined,
                                    take: (limit !== undefined && limit > 0) ? limit : undefined
                                })
                        })

                        return res.status(200).json({ countries })
                    }
                    default:
                        return res.status(400).json({ error: 'Unhandled Country Statistic!' })
                }
            } catch (e: any) {
                return res.status(400).json({ error: e?.message ?? 'Invalid Query Parameters' })
            }
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}