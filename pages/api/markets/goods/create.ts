import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	countryMarket: number
	offer: {
		itemId: number
		quantity: number
		price: number
		currency: string
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { compId, offer } = JSON.parse(req.body) as ReqBody

			try {
				let result = await withPrisma(async (client: PrismaClient) => {
					return await client.$transaction(async (prisma) => {
						// Get StorageItem id
						const item = await prisma.storageItem.findFirst({
							where: {
								compId,
								itemId: offer.itemId,
							},
							select: { id: true, quantity: true },
						})

						if (!item) throw new Error('Item Not Found')

						// Ensure Company Item Count Doesn't Go Negative
						const diff = item.quantity - offer.quantity
						if (diff < 0) throw new Error('Insufficient Item Quantity')

						const shouldDeleteItem = diff == 0

						// Subtract Item From Company and Create Product Offer
						const comp = await prisma.company.update({
							where: { id: compId },
							data: {
								inventory: {
									delete: shouldDeleteItem ? { id: item.id } : undefined,
									update: !shouldDeleteItem
										? {
												where: { id: item.id },
												data: {
													quantity: { decrement: offer.quantity },
												},
										  }
										: undefined,
								},
								productOffers: {
									create: {
										itemId: offer.itemId,
										price: offer.price,
										quantity: offer.quantity,
										currencyCode: offer.currency,
									},
								},
							},
						})

						return [comp]
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
