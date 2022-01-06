import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	offer: {
		id: number
		itemId: number
		quantity: number
		price: number
		diff: number
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { compId, offer } = JSON.parse(req.body) as ReqBody

			let updated = await withPrisma(async (client: PrismaClient) => {
				return await client.company.update({
					where: { id: compId },
					data: {
						inventory: {
							update: {
								where: { id: offer.id },
								data: { quantity: offer.diff < 0 ? { decrement: offer.diff } : { increment: offer.diff } },
							},
						},
						productOffers: {
							update: {
								where: { id: offer.id },
								data: {
									quantity: offer.quantity,
									price: offer.price,
								},
							},
						},
					},
				})
			})

			if (updated) return res.status(200).json({ success: true })
			return res.status(500).json({ error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
