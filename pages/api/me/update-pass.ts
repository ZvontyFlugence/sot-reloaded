import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import withPrisma from '@/core/prismaClient'
import { getSession } from 'next-auth/react'
import bcrypt from 'bcrypt'

interface UpdatePassReq {
	currPw: string
	newPw: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		switch (req.method) {
			case 'POST': {
				const session = await getSession({ req })
				if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

				const { currPw, newPw } = JSON.parse(req.body) as UpdatePassReq

				let updated = await withPrisma(async (client: PrismaClient) => {
					let user = await client.user.findUnique({
						where: { id: session.user.id },
						select: { password: true },
					})

					if (!user) return null

					if (await bcrypt.compare(currPw, user.password)) {
						let hashedPw = await bcrypt.hash(newPw, 10)
						return await client.user.update({
							where: { id: session.user.id },
							data: { password: hashedPw },
						})
					}

					return null
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
