import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	offerId: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'DELETE': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { compId, offerId } = JSON.parse(req.body) as ReqBody

			let deleted = await withPrisma(async (client: PrismaClient) => {
				return await client.company.update({
					where: { id: compId },
					data: {
						jobOffers: {
							delete: { id: offerId },
						},
					},
				})
			})

			if (deleted) return res.status(200).json({ success: true })
			return res.status(500).json({ success: false, error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
