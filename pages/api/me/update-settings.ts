import { NextApiRequest, NextApiResponse } from 'next'
import { Prisma, PrismaClient } from '@prisma/client'
import withPrisma from '@/core/prismaClient'
import { getSession } from 'next-auth/react'

interface UpdateSettingsReq {
	username?: string
	description?: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		switch (req.method) {
			case 'POST': {
				const session = await getSession({ req })
				if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

				const { username, description } = JSON.parse(req.body) as UpdateSettingsReq

				let updated = await withPrisma(async (client: PrismaClient) => {
					return await client.user.update({
						where: { id: session.user.id },
						data: { username, description },
					})
				})

				if (updated) return res.status(200).json({ success: true })
				return res.status(500).json({ success: false, error: 'Something Went Wrong' })
			}
			default:
				return res.status(404).json({ error: 'Unhandled HTTP Method' })
		}
	} catch (e: any) {
		console.error(e?.message)
	}
}
