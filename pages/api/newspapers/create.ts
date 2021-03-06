import withPrisma from '@/core/prismaClient'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	name: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { name } = JSON.parse(req.body) as ReqBody

			try {
				let created = await withPrisma(async (client) => {
					return await client.$transaction(async (prisma) => {
						const author = await client.user.update({
							where: { id: session.user.id },
							data: {
								gold: { decrement: 5 },
								newspaper: {
									create: {
										image: process.env.DEFAULT_IMG as string,
										name,
									},
								},
							},
							select: { gold: true, newsId: true },
						})

						if (!author || convertDecimal(author.gold) < 0) throw new Error('Insufficient Funds')

						return [author]
					})
				})

				if (created) return res.status(200).json({ success: true, newsId: created[0].newsId })

				return res.status(500).json({ success: false, error: 'Something Went Wrong' })
			} catch (e: any) {
				console.error(e?.message)
				return res.status(400).json({ success: false, error: e?.message })
			}
		}
		default:
			return res.status(404).json({ error: 'Something Went Wrong' })
	}
}
