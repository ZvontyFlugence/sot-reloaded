import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '.prisma/client'
import withPrisma from '../../../core/prismaClient'

const UserStats = {
    STRENGTH: 'str',
    XP: 'xp'
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            const { scope, stat, sort, limit: limitStr, country } = req.query

            if (typeof scope !== 'string' || typeof stat !== 'string' || (sort && typeof sort !== 'string')
                || (limitStr && typeof limitStr !== 'string') || (country && typeof country !== 'string'))
                return res.status(400).json({ error: 'Invalid Query Parameters' })

            if (!Object.values(UserStats).includes(stat))
                return res.status(400).json({ error: 'Unsupported User Statistic' })

            let limit: number
            try {
                if (limitStr)
                    limit = Number.parseInt(limitStr)
            } catch (e: any) {
                return res.status(400).json({ error: 'Limit Must Be An Integer' })
            }

            let users = await withPrisma(async (client: PrismaClient) => {
                return await client.user.findMany({
                    where: (scope === 'country') ? ({
                        countryId: Number.parseInt(country)
                    }) : undefined,
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        country: {
                            select: {
                                id: true,
                                name: true,
                                flagCode: true
                            }
                        },
                        strength: stat === UserStats.STRENGTH ? true : false,
                        xp: stat === UserStats.XP ? true : false,
                        password: false
                    },
                    orderBy: {
                        strength: (stat === UserStats.STRENGTH) ? (sort === 'asc') ? 'asc' : 'desc' : undefined,
                        xp: (stat === UserStats.XP) ? (sort === 'asc') ? 'asc' : 'desc' : undefined,
                    },
                    take: (limit !== undefined && limit > 0) ? limit : undefined,
                })
            })

            return res.status(200).json({ citizens: users })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}