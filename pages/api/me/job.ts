import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '.prisma/client'
import withPrisma from '../../../core/prismaClient'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            let session = await getSession({ req })
            if (!session)
                return res.status(403).json({ error: 'Unauthorized' })

            let job = await withPrisma(async (client: PrismaClient) => {
                return await client.user
                    .findFirst({ where: { id: session?.user.id } })
                    .job()
            })

            return res.status(200).json({ job })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}