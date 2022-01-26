import withPrisma from '@/core/prismaClient'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	offerId: number
	quantity: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { offerId, quantity } = JSON.parse(req.body) as ReqBody

			try {
				let result = await withPrisma(async (client) => {
					return await client.$transaction(async (prisma) => {
						// Get Offer
						let offer = await prisma.productOffer.findUnique({ where: { id: offerId } })
						if (!offer) throw new Error('Product Offer Not Found')

						// Calculate Cost
						let cost = convertDecimal(offer.price) * quantity

						// Subtract Funds from User and Add Items
						let userFunds = await prisma.walletBalance.findFirst({
							where: {
								ownerId: session.user.id,
								currency: { code: offer.currencyCode },
								amount: { gte: cost },
							},
							select: { id: true },
						})

						if (!userFunds) throw new Error('Insufficient Funds')

						let userItem = await prisma.invItem.findFirst({
							where: {
								userId: session.user.id,
								itemId: offer.itemId,
							},
							select: { id: true },
						})

						let updatedUser = await prisma.user.update({
							where: { id: session.user.id },
							data: {
								wallet: {
									update: {
										where: { id: userFunds.id },
										data: { amount: { decrement: cost } },
									},
								},
								inventory: {
									upsert: {
										create: {
											quantity,
											itemId: offer.itemId,
										},
										update: { quantity: { increment: quantity } },
										where: { id: userItem?.id ?? -1 },
									},
								},
							},
						})

						// Add Funds to Company and Subtract Items
						let compFunds = await prisma.fundsBalance.findFirst({
							where: {
								compId: offer.compId,
								currencyId: offer.currencyCode,
							},
							select: { id: true },
						})

						// TODO: Handle Value Added Tax (VAT)
						let updatedCompany = await prisma.company.update({
							where: { id: offer.compId },
							data: {
								funds: {
									upsert: {
										create: {
											amount: cost,
											currencyId: offer.currencyCode,
										},
										update: {
											amount: { increment: cost },
										},
										where: { id: compFunds?.id ?? '' },
									},
								},
								productOffers: {
									update: {
										where: { id: offerId },
										data: {
											quantity: { decrement: quantity },
										},
									},
								},
							},
							select: {
								productOffers: {
									where: { id: offerId },
									select: { quantity: true },
								},
							},
						})

						// Cancel if offer goes negative
						if (updatedCompany.productOffers[0].quantity < 0) throw new Error('Insufficient Product Quantity')

						// Delete Offer if 0 remaining quantity
						if (updatedCompany.productOffers[0].quantity === 0)
							await prisma.productOffer.delete({ where: { id: offerId } })

						return [updatedUser, updatedCompany]
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
