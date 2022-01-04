import withPrisma from '@/core/prismaClient'
import { Company, PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            const session = await getSession({ req })
            if (!session || !session.user.id)
                return res.status(403).json({ error: 'Unauthorized' })

            let companies: Company[] = await withPrisma(async (client: PrismaClient) => {
                return await client.company.findMany({
                    where: {
                        ceoId: session.user.id,
                    }
                })
            })

            return res.status(200).json({ companies })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}