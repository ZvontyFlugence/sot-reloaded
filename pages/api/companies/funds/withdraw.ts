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
					return await client.$transaction(async (prisma) => {
						// Find Comp Funds Balance For Desired Currency
						let fundsBalanceId: number = -1

						if (funds) {
							const compFunds = await prisma.fundsBalance.findFirst({
								where: {
									compId,
									currencyId: funds.currency,
								},
								select: { id: true },
							})

							if (!compFunds) throw new Error('Funds Balance Not Found')
							fundsBalanceId = compFunds.id
						}

						// Subtract Gold and/or Balance from Comp
						const sender = await prisma.company.update({
							where: { id: compId },
							data: {
								gold: gold ? { decrement: gold } : undefined,
								funds: funds
									? {
											update: {
												where: { id: fundsBalanceId },
												data: { amount: { decrement: funds.amount } },
											},
									  }
									: undefined,
							},
							select: {
								gold: true,
								funds: funds
									? {
											where: { id: fundsBalanceId },
											select: { amount: true },
									  }
									: undefined,
							},
						})

						if (!sender) throw new Error('Company Not Found')

						// Ensure Comp Did Not Go Negative
						if (convertDecimal(sender.gold) < 0 || convertDecimal(sender.funds[0].amount) < 0)
							throw new Error('Insufficient Funds')

						// Check if User Already Has Balance for Target Currency
						const userWallet = await prisma.walletBalance.findFirst({
							where: {
								ownerId: session.user.id,
								currency: { code: funds?.currency },
							},
							select: { id: true },
						})

						// Add Balance to User
						const recipient = await prisma.user.update({
							where: { id: session.user.id },
							data: {
								gold: gold ? { increment: gold } : undefined,
								wallet: funds
									? {
											upsert: {
												create: {
													currency: {
														connect: {
															code: funds.currency,
														},
													},
													amount: funds.amount,
												},
												update: {
													amount: { increment: funds.amount },
												},
												where: { id: userWallet?.id ?? -1 },
											},
									  }
									: undefined,
							},
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
