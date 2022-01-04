import { PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import withPrisma from '../../../core/prismaClient'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'DELETE': {
            const session = await getSession({ req })
            if (!session || !session.user.id)
                return res.status(403).json({ success: false, error: 'Unauthorized' })

            const { alertId } = JSON.parse(req.body) as { alertId: number }

            if (!alertId)
                return res.status(400).json({ success: false, error: 'Must Provide An Alert ID' })

            let deleted = await withPrisma(async (client: PrismaClient) => {
                return await client.alert.delete({
                    where: { id: alertId }
                })
            })

            if (deleted)
                return res.status(200).json({ success: true })

            return res.status(500).json({ success: false, error: 'Something Went Wrong' })
        }
        default:
            return res.status(404).json({ success: false, error: 'Unhandled HTTP Method' })
    }
}