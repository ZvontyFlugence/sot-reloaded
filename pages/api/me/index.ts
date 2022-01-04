import { PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import withPrisma from '../../../core/prismaClient'

export default async function (req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET': {
            const session = await getSession({ req })
            if (!session || !session.user.id)
                return res.status(403).json({ error: 'Unauthorized' })

            let user = await withPrisma(async (client: PrismaClient) => {
                return await client.user.findFirst({
                    where: { id: session.user.id }
                })
            })

            if (user)
                return res.status(200).json({ user })
            
            return res.status(404).json({ error: 'User Not Found' })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}