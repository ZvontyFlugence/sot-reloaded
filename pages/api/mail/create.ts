import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	participants: number[]
	subject: string
	content: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { participants, subject, content } = JSON.parse(req.body) as ReqBody

			let [instances, thread, msg] = await withPrisma(async (client: PrismaClient) => {
				let thread = await client.msgThread.create({
					data: {
						subject,
						participants: {
							connect: [...participants.map((participantId) => ({ id: participantId }))],
						},
					},
				})

				let instances = await Promise.all(
					participants.map(async (p: number) => {
						return await client.mail.createMany({
							data: {
								threadId: thread.id,
								userId: p,
								read: p === session.user.id,
							},
						})
					})
				)

				let msg = await client.msg.create({
					data: {
						content,
						from: session.user.id,
						threadId: thread.id,
					},
				})

				return [instances, thread, msg]
			})

			if (instances && thread && msg) return res.status(200).json({ success: true })
			return res.status(500).json({ error: 'Something Went Wrong' })
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
