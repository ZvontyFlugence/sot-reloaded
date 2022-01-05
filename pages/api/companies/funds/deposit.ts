import withPrisma from '@/core/prismaClient'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

interface ReqBody {
	compId: number
	gold?: number
	funds?: {
		currency: string
		amount: number
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { compId, gold, funds } = JSON.parse(req.body) as ReqBody

			try {
				let result = await withPrisma(async (client: PrismaClient) => {
					return await client.$transaction(async prisma => {
						// Find User Wallet Balance For Desired Currency
						let walletBalanceId: number = -1

						if (funds) {
							const userWallet = await prisma.walletBalance.findFirst({
								where: {
									ownerId: session.user.id,
									currency: {
										code: funds?.currency
									}
								},
								select: { id: true }
							})

							if (!userWallet) throw new Error('Wallet Balance Not Found')
							walletBalanceId = userWallet.id
						}

						// Subtract Gold and/or Balance from User
						const sender = await prisma.user.update({
							where: {
								id: session.user.id
							},
							data: {
								gold: gold ? { decrement: gold } : undefined,
								wallet: funds
									? {
											update: {
												where: { id: walletBalanceId },
												data: {
													amount: { decrement: funds.amount }
												}
											}
									  }
									: undefined
							},
							select: {
								gold: true,
								wallet: funds
									? {
											where: { id: walletBalanceId },
											select: {
												amount: true
											}
									  }
									: undefined
							}
						})

						if (!sender) throw new Error('User Not Found')

						// Ensure User Did Not Go Negative
						if (convertDecimal(sender.gold) < 0 || convertDecimal(sender.wallet[0].amount) < 0)
							throw new Error('Insufficient Balance')

						// Check if Company Already Has Balance for Target Currency
						const compFunds = await prisma.fundsBalance.findFirst({
							where: {
								compId,
								currency: { code: funds?.currency }
							},
							select: { id: true }
						})

						// Add Funds to Company
						const recipient = await prisma.company.update({
							where: { id: compId },
							data: {
								gold: gold ? { increment: gold } : undefined,
								funds: funds
									? {
											upsert: {
												create: {
													currency: {
														connect: {
															code: funds.currency
														}
													},
													amount: funds.amount
												},
												update: {
													amount: { increment: funds.amount }
												},
												where: { id: compFunds?.id ?? '' }
											}
									  }
									: undefined
							}
						})

						if (!recipient) throw new Error('Something Went Wrong')
						return [sender, recipient]
					})
				})

				if (result) return res.status(200).json({ success: true })
				return res.status(500).json({ success: false, error: 'Something Went Wrong' })
			} catch (e: any) {
				console.error(e?.message)
				return res.status(400).json({ success: false, error: e?.message })
			}
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
