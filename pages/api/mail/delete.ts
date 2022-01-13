import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	threadId: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'DELETE': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { threadId } = JSON.parse(req.body) as ReqBody

			let deleted = await withPrisma(async (client: PrismaClient) => {
				return await client.mail.delete({
					where: { threadId_userId: { threadId, userId: session.user.id } },
				})
			})

			if (deleted) return res.status(200).json({ success: true })
			return res.status(500).json({ error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
