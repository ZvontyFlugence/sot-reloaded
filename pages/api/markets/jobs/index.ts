import withPrisma from '@/core/prismaClient'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'GET': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			let countryId: number = -1
			try {
				countryId = parseInt(req.query.country_id as string)
			} catch (e: any) {
				return res.status(400).json({ error: 'Invalid Country ID' })
			}

			let jobOffers = await withPrisma(async (client: PrismaClient) => {
				return await client.jobOffer.findMany({
					where: {
						comp: { location: { ownerId: countryId } },
					},
					include: {
						comp: {
							select: {
								id: true,
								name: true,
								image: true,
								type: true,
								ceoId: true,
							},
						},
					},
				})
			})

			jobOffers.sort((job1, job2) => convertDecimal(job1.wage) - convertDecimal(job2.wage))

			return res.status(200).json({ jobOffers })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
