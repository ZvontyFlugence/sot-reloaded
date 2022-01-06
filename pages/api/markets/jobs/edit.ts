import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	offer: {
		id: number
		title: string
		quantity: number
		wage: number
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
						jobOffers: {
							update: {
								where: { id: offer.id },
								data: {
									title: offer.title,
									quantity: offer.quantity,
									wage: offer.wage,
								},
							},
						},
					},
				})
			})

			if (updated) return res.status(200).json({ success: true })
			return res.status(500).json({ success: false, error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
