import { PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import withPrisma from '../../../core/prismaClient'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            let session = await getSession({ req })
            if (!session) {
                return res.status(403).json({ error: 'Unauthorized' })
            }

            let locationInfo = await withPrisma(async (client: PrismaClient) => {
                let user = await client.user.findFirst({
                    where: { id: session?.user.id }
                })

                return await client.region.findFirst({
                    where: {
                        id: user?.locationId
                    },
                    select: {
                        id: true,
                        name: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                nick: true,
                                flagCode: true,
                            }
                        }
                    }
                })
            })

            if (locationInfo)
                return res.status(200).json({ locationInfo })

            return res.status(500).json({ error: 'Something Went Wrong' })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}