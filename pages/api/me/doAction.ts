import { NextApiRequest, NextApiResponse } from 'next'
import { InvItem, Prisma, PrismaClient } from '@prisma/client'
import withPrisma from '@/core/prismaClient'
import { getSession } from 'next-auth/react'
import { UserActions } from '@/core/enums'
import neededXP from '@/core/neededXP'
import {
	buildDonationAlert,
	buildLevelUpAlert,
	buildSendFriendReqAlert,
	buildSuperSoldierAlert,
} from '@/core/apiHelpers/alertBuilder'
import { Decimal } from '@prisma/client/runtime'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		switch (req.method) {
			case 'POST': {
				const session = await getSession({ req })
				if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

				const { action, data } = JSON.parse(req.body)

				switch (action) {
					case UserActions.COLLECT_REWARDS: {
						let result = await collect_rewards(session.user.id)
						return res.status(result.status).json(result.body)
					}
					case UserActions.DONATE: {
						let result = await donate(session.user.id, data)
						return res.status(result.status).json(result.body)
					}
					case UserActions.GIFT: {
						let result = await gift(session.user.id, data)
						return res.status(result.status).json(result.body)
					}
					case UserActions.HEAL: {
						let result = await heal(session.user.id)
						return res.status(result.status).json(result.body)
					}
					case UserActions.MOVE_RESIDENCE: {
						let result = await move_residence(session.user.id, data)
						return res.status(result.status).json(result.body)
					}
					case UserActions.SEND_FR: {
						let result = await send_fr(session.user.id, data)
						return res.status(result.status).json(result.body)
					}
					case UserActions.TRAIN: {
						let result = await train(session.user.id)
						return res.status(result.status).json(result.body)
					}
					case UserActions.TRAVEL: {
						let result = await travel(session.user.id, data)
						return res.status(result.status).json(result.body)
					}
					default:
						return res.status(400).json({ error: 'Unknown User Action' })
				}
			}
			default:
				return res.status(404).json({ error: 'Unhandled HTTP Method' })
		}
	} catch (e: any) {
		console.error(e?.message)
	}
}

async function collect_rewards(userId: number) {
	try {
		let updated = await withPrisma(async (client: PrismaClient) => {
			let data: { xp: number; level: number } | null = await client.user.findFirst({
				where: {
					id: userId,
					canCollectRewards: {
						lte: new Date(Date.now()),
					},
				},
				select: { xp: true, level: true },
			})

			if (!data) throw new Error('You Have Already Collected Rewards Today')

			let isLevelUp: boolean = false
			if (data.xp + 1 > neededXP(data.level)) isLevelUp = true

			return await client.user.update({
				where: {
					id: userId,
				},
				data: {
					canCollectRewards: new Date(new Date().setUTCHours(24, 0, 0, 0)),
					gold: isLevelUp ? { increment: 5.0 } : undefined,
					level: isLevelUp ? { increment: 1 } : undefined,
					xp: { increment: 1 },
					alerts: isLevelUp
						? {
								create: buildLevelUpAlert(data.level + 1),
						  }
						: undefined,
				},
			})
		})

		if (updated)
			return {
				status: 200,
				body: { success: true, message: 'You have received +1 XP' },
			}

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		// Transaction Failed
		console.error(e?.message)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

interface DonateReqBody {
	profileId: number
	gold?: number
	funds?: {
		balanceId: number
		amount: number
	}
}

type IWalletBalance = {
	amount: Decimal
	currencyId: number
	currency: {
		code: string
	}
}

async function donate(userId: number, data: DonateReqBody) {
	try {
		let recipient = await withPrisma(async (client: PrismaClient) => {
			return await client.$transaction(async (prisma) => {
				// Decrement Sender Amount
				const sender: any = await prisma.user.update({
					where: { id: userId },
					data: {
						gold: data.gold ? { decrement: data.gold } : undefined,
						wallet: data.funds
							? {
									update: {
										where: { id: data.funds.balanceId },
										data: {
											amount: { decrement: data.funds.amount },
										},
									},
							  }
							: undefined,
					},
					select: {
						username: true,
						gold: true,
						wallet: data.funds
							? {
									where: { id: data.funds?.balanceId },
									select: {
										amount: true,
										currencyId: true,
										currency: {
											select: { code: true },
										},
									},
							  }
							: undefined,
					},
				})

				// Verify Sender Didn't Go Negative
				if (
					Number.parseFloat(sender.gold.toString()) < 0 ||
					(sender.wallet.length === 1 && Number.parseFloat(sender.wallet[0].amount.toString()) < 0)
				)
					throw new Error('Insufficient Funds')

				// Get Id of Recipient Wallet Balance For Target Currency
				const recipientBalance = await prisma.walletBalance.findFirst({
					where: {
						ownerId: data.profileId,
						currencyId: sender.wallet[0].currencyId,
					},
					select: { id: true },
				})

				// Increment Recipient Amount And Create Donation Alert
				return await prisma.user.update({
					where: { id: data.profileId },
					data: {
						alerts: {
							create: buildDonationAlert(
								{ id: userId, name: sender.username },
								data.gold,
								(sender.wallet[0] as IWalletBalance).currency.code,
								data.funds?.amount
							),
						},
						gold: data.gold ? { increment: data.gold } : undefined,
						wallet: data.funds
							? {
									upsert: {
										create: {
											amount: data.funds.amount,
											currencyId: sender.wallet[0].currencyId,
										},
										update: {
											amount: { increment: data.funds.amount },
										},
										where: { id: recipientBalance?.id },
									} as Prisma.WalletBalanceUpsertWithWhereUniqueWithoutOwnerInput | undefined,
							  }
							: undefined,
					},
				})
			})
		})

		if (recipient) return { status: 200, body: { success: true } }

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		console.error(e?.message)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

interface GiftReqBody {
	profileId: number
	items: InvItem[]
}

async function gift(userId: number, data: GiftReqBody) {
	try {
		let updated = await withPrisma(async (client: PrismaClient) => {
			return await client.$transaction(async (prisma) => {
				let updatedItems: InvItem[] = []

				// Decrement Sender Quantities
				for (let item of data.items) {
					if (item.userId !== userId) throw new Error('Cannot Gift Items Owned By Someone Else')

					updatedItems.push(
						await prisma.invItem.update({
							where: { id: item.id },
							data: {
								quantity: { decrement: item.quantity },
							},
						})
					)
				}

				// Make sure no quantities went negative
				if (updatedItems.some((item) => item.quantity < 0)) throw new Error('Insufficient Item Quantities')

				// Delete All Records with 0 quantity
				let emptyRecords = updatedItems.filter((item) => item.quantity === 0).map((item) => item.id)

				if (emptyRecords.length > 0) {
					await prisma.invItem.deleteMany({
						where: { id: { in: emptyRecords } },
					})
				}

				// Increment Recipient Quantities
				if (emptyRecords.length < updatedItems.length) {
					return await prisma.user.update({
						where: { id: data.profileId },
						data: {
							inventory: {
								upsert: [
									...updatedItems
										.filter((item) => item.quantity > 0)
										.map((item) => ({
											create: {
												itemId: item.itemId,
												quantity: item.quantity,
											},
											update: { quantity: { increment: item.quantity } },
											where: { itemId: item.itemId },
										})),
								] as Prisma.InvItemUpsertWithWhereUniqueWithoutUserInput[] | undefined,
							},
						},
					})
				}

				return null
			})
		})

		if (updated) return { status: 200, body: { success: true } }

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		console.error(e?.message)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

async function heal(userId: number) {
	interface UserQuery {
		health: number
	}

	try {
		let updated = await withPrisma(async (client: PrismaClient) => {
			let query: UserQuery | null = await client.user.findFirst({
				where: { id: userId },
				select: { health: true },
			})

			if (!query) throw new Error('User Not Found')

			if (query.health >= 100) throw new Error('Your Health Is Already Full')

			return await client.user.update({
				where: { id: userId },
				data: {
					health: {
						increment: Math.min(100 - query.health, 50),
					},
				},
			})
		})

		if (updated) return { status: 200, body: { success: true } }

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		console.error(e?.message)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

async function move_residence(userId: number, data: { regionId: number }) {
	let updated = await withPrisma(async (client: PrismaClient) => {
		return await client.user.update({
			where: { id: userId },
			data: { residenceId: data.regionId },
		})
	})

	if (updated) return { status: 200, body: { success: true } }

	return { status: 500, body: { success: false, error: 'Something Went Wrong' } }
}

interface SendFriendReqBody {
	profileId: number
}

async function send_fr(userId: number, data: SendFriendReqBody) {
	try {
		let result = await withPrisma(async (client: PrismaClient) => {
			// Ensure sender isnt already recipient's friend or pending friend
			const recipient = await client.user.findFirst({
				where: { id: data.profileId },
				include: {
					friends: true,
					pendingFriends: true,
				},
			})

			if (!recipient) throw new Error('User Not Found')

			if (recipient.friends.findIndex((fr) => fr.friendId === userId) !== -1)
				throw new Error('User Is Already A Friend')
			else if (recipient.pendingFriends.findIndex((pfr) => pfr.pending === userId) !== -1)
				throw new Error('You Already Sent A Friend Request')

			// Get Sender's username
			const sender = await client.user.findFirst({
				where: { id: userId },
				select: { username: true },
			})

			if (!sender) throw new Error('User Not Found')

			// Create Pending Friend Request Record For Recipient and Friend Request Alert
			return await client.user.update({
				where: { id: data.profileId },
				data: {
					alerts: { create: buildSendFriendReqAlert({ id: userId, name: sender.username }) },
					pendingFriends: {
						create: {
							pending: userId,
						},
					},
				},
			})
		})

		if (result) return { status: 200, body: { success: true } }

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		console.error(e)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

async function train(userId: number) {
	interface UserQuery {
		health: number
		level: number
		strength: number
		xp: number
	}

	try {
		let updated = await withPrisma(async (client: PrismaClient) => {
			let query: UserQuery | null = await client.user.findFirst({
				where: {
					id: userId,
					canTrain: {
						lte: new Date(Date.now()),
					},
				},
				select: { xp: true, level: true, strength: true, health: true },
			})

			if (!query) throw new Error('You Have Already Trained Today')

			if (query.health < 10) throw new Error("You Don't Have Enough Health")

			let isLevelUp: boolean = false
			let newAlerts: Prisma.AlertCreateWithoutToInput[] = []
			let reward: number = 0
			if (query.xp + 1 >= neededXP(query.level)) {
				isLevelUp = true
				newAlerts.push(buildLevelUpAlert(query.level + 1))
				reward += 5
			}

			let isSuperSoldier: boolean = false
			if ((query.strength + 1) % 250 === 0) {
				isSuperSoldier = true
				newAlerts.push(buildSuperSoldierAlert())
				reward += 5
			}

			return await client.user.update({
				where: {
					id: userId,
				},
				data: {
					canTrain: new Date(new Date().setUTCHours(24, 0, 0, 0)),
					gold: isLevelUp || isSuperSoldier ? { increment: reward } : undefined,
					health: { decrement: 10 },
					level: isLevelUp ? { increment: 1 } : undefined,
					strength: { increment: 1 },
					superSoldier: isSuperSoldier ? { increment: 1 } : undefined,
					xp: { increment: 1 },
					alerts: isLevelUp || isSuperSoldier ? { create: newAlerts } : undefined,
				},
			})
		})

		if (updated)
			return {
				status: 200,
				body: {
					success: true,
					message: 'You have received +1 XP and +1 Strength',
				},
			}

		return {
			status: 500,
			body: { success: false, error: 'Something Went Wrong' },
		}
	} catch (e: any) {
		// Transaction Failed
		console.error(e?.message)
		return { status: 400, body: { success: false, error: e?.message } }
	}
}

async function travel(userId: number, data: { regionId: number }) {
	let updated = await withPrisma(async (client: PrismaClient) => {
		return await client.user.update({
			where: { id: userId },
			data: { locationId: data.regionId },
		})
	})

	if (updated) return { status: 200, body: { success: true } }

	return { status: 500, body: { success: false, error: 'Something Went Wrong' } }
}
