import { IRegion } from '@/core/interfaces'
import withPrisma from '@/core/prismaClient'
import { Prisma, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

	switch (req.method) {
		case 'GET': {
			let regions: IRegion[] = await withPrisma(async (client: PrismaClient) => {
				return await client.region.findMany({})
			})

			return res.status(200).json({ regions })
		}
		case 'POST': {
			const data = JSON.parse(req.body) as Prisma.RegionInclude

			let regions = await withPrisma(async (client) => {
				return await client.region.findMany({
					include: data,
				})
			})

			return res.status(200).json({ regions })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
