import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'GET': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			let countries = await withPrisma(async (client: PrismaClient) => {
				return await client.country.findMany({
					include: {
						currency: true,
					},
				})
			})

			return res.status(200).json({ countries })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
