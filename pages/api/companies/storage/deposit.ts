import withPrisma from '@/core/prismaClient'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	inventoryId: number
	itemId: number
	compId: number
	quantity: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { inventoryId, itemId, compId, quantity } = JSON.parse(req.body) as ReqBody

			try {
				let result = await withPrisma(async (client) => {
					return await client.$transaction(async (prisma) => {
						// Subtract Quantity from InvItem
						let updatedInvItem = await prisma.invItem.update({
							where: { id: inventoryId },
							data: {
								quantity: { decrement: quantity },
							},
							select: { quantity: true },
						})

						if (updatedInvItem.quantity < 0) throw new Error('Insufficient Item Quantity')
						else if (updatedInvItem.quantity === 0) await prisma.invItem.delete({ where: { id: inventoryId } })

						// Add Quantity to Company Storage Items
						let existingStorageItem = await prisma.storageItem.findFirst({
							where: {
								compId,
								itemId,
							},
							select: { id: true },
						})

						let updatedCompany = await prisma.company.update({
							where: { id: compId },
							data: {
								inventory: {
									upsert: {
										create: {
											itemId,
											quantity,
										},
										update: { quantity: { increment: quantity } },
										where: { id: existingStorageItem?.id ?? -1 },
									},
								},
							},
						})

						return [updatedInvItem, updatedCompany]
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
