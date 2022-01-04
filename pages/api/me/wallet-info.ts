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

            let walletInfo = await withPrisma(async (client: PrismaClient) => {
                return await client.walletBalance.findMany({
                    where: { ownerId: session?.user.id },
                    select: {
                        id: true,
                        amount: true,
                        currency: {
                            select: {
                                code: true,
                                country: {
                                    select: {
                                        flagCode: true
                                    }
                                }
                            }
                        }
                    }
                })
            })

            if (walletInfo)
                return res.status(200).json({ walletInfo })
            
            return res.status(500).json({ error: 'Something Went Wrong' })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}