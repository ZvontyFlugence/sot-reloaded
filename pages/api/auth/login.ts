import { User } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import withPrisma from '../../../core/prismaClient'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

interface ILoginRequest {
	email: string
	password: string
	ip: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const { email, password, ip } = JSON.parse(req.body) as ILoginRequest

			// Ensure DB Connection and Lookup User
			let user = await withPrisma<(User & { ipAddrs: { ip: string }[] }) | null>(async (client) => {
				let account = await client.user.findUnique({
					where: { email },
					include: {
						ipAddrs: {
							select: { ip: true },
						},
					},
				})

				if (account && (await bcrypt.compare(password, account.password))) {
					if (!account.ipAddrs.includes({ ip })) {
						await client.ipAddr.create({
							data: {
								ip,
								user: {
									connect: {
										id: account.id,
									},
								},
							},
						})
					}

					return account
				}

				return null
			})

			if (!user) {
				return res.status(400).json({ success: false, error: 'Invalid Credentials' })
			}

			// Validate Password
			if (user) {
				if (user.banned) {
					return res.status(403).json({ success: false, error: 'Your Account Is Banned!' })
				}

				let token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
				const { password: _pw, ipAddrs: _ip, ...safeUser } = user

				return res.status(200).json({ success: true, user: JSON.stringify(safeUser), token })
			}

			// Return Response
			return res.status(400).json({ success: false, error: 'Invalid Credentials' })
		}
		default: {
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
		}
	}
}
