import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface CreateCompRequest {
	name: string
	type: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { name, type } = JSON.parse(req.body) as CreateCompRequest

			if (type < 0 || type > 6) return res.status(400).json({ error: 'Invalid Company Type' })

			let company = await withPrisma(async (client: PrismaClient) => {
				let location = await client.user.update({
					where: { id: session.user.id },
					data: {
						gold: { decrement: 25.0 },
					},
					select: { locationId: true },
				})

				return await client.company.create({
					data: {
						name,
						image: process.env.DEFAULT_IMG,
						type,
						ceo: {
							connect: {
								id: session.user.id,
							},
						},
						location: {
							connect: {
								id: location?.locationId,
							},
						},
					},
				})
			})

			if (company) return res.status(200).json({ success: true, companyId: company.id })

			return res.status(500).json({ success: false, error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
