import { PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import withPrisma from '../../../core/prismaClient'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET': {
            let result = await withPrisma(async (client: PrismaClient) => {
                return await client.$executeRaw`TRUNCATE TABLE "${'sot.Region'}";`
            })

            if (result) {
                return res.status(200).json({ success: true })
            }

            return res.status(500).json({ success: false, error: 'Something Went Wrong' })
        }
        default:
            return res.status(404).json({ error: 'Unhandled HTTP Method' })
    }
}