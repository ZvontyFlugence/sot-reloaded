import { PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import withPrisma from '../../../core/prismaClient'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            const session = await getSession({ req })
            if (!session || !session.user.id)
                return res.status(403).json({ error: 'Unauthorized' })

            let users = await withPrisma(async (client: PrismaClient) => {
                return await client.user.findMany()
            })

            return res.status(200).json({ users })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}