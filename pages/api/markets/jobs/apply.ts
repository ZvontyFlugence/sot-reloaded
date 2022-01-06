import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	jobId: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { compId, jobId } = JSON.parse(req.body) as ReqBody

			try {
				let result = await withPrisma(async (client: PrismaClient) => {
					return await client.$transaction(async (prisma) => {
						// Decrement JobOffer Quantity
						const offer = await prisma.jobOffer.update({
							where: { id: jobId },
							data: {
								quantity: { decrement: 1 },
							},
							select: {
								wage: true,
								title: true,
								quantity: true,
							},
						})

						if (!offer) throw new Error('Job Offer Not Found')

						// Delete JobOffer Record if Quantity === 0
						if (offer.quantity === 0) await prisma.jobOffer.delete({ where: { id: jobId } })

						// Create JobRecord and Assign to User
						const created = await prisma.user.update({
							where: { id: session.user.id },
							data: {
								job: {
									create: {
										comp: {
											connect: {
												id: compId,
											},
										},
										title: offer.title,
										userId: session.user.id,
										wage: offer.wage,
									},
								},
							},
						})

						return [offer, created]
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
