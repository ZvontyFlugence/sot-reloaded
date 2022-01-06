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

			try {
				let result = await withPrisma(async (client: PrismaClient) => {
					return await client.$transaction(async (prisma) => {
						// Delete Product Offer
						const offer = await prisma.productOffer.delete({
							where: { id: offerId },
							select: { itemId: true, quantity: true },
						})

						if (!offer) throw new Error('Product Offer Not Found')

						// Look for Existing StorageItem Record
						const item = await prisma.storageItem.findFirst({
							where: { compId, itemId: offer.itemId },
							select: { id: true },
						})

						// Add Items Back Into Comp Storage
						const updated = await prisma.company.update({
							where: { id: compId },
							data: {
								inventory: {
									upsert: {
										create: { ...offer },
										update: {
											quantity: { increment: offer.quantity },
										},
										where: { id: item?.id ?? -1 },
									},
								},
							},
						})

						return [offer, updated]
					})
				})

				if (result) return res.status(200).json({ success: true })
				return res.status(500).json({ success: false, error: 'Something Went Wrong' })
			} catch (e: any) {
				console.error(e?.message)
				return res.status(400).json({ success: false, error: e?.message })
			}
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
