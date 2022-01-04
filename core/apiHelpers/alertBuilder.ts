import { AlertTypes } from '../enums'

const genericAlertBuilder = (type: string) => ({
	read: false,
	type,
	timestamp: new Date(Date.now()),
})

export const buildLevelUpAlert = (level: number) => ({
	...genericAlertBuilder(AlertTypes.LEVEL_UP),
	message: `Congrats! You have leveled up to level ${level} and received 5 gold`,
})

export const buildSuperSoldierAlert = () => ({
	...genericAlertBuilder(AlertTypes.SUPER_SOLDIER),
	message: 'You are a Super Soldier and have received 5 gold',
})

interface SenderInfo {
	id: number
	name: string
}

export const buildDonationAlert = (sender: SenderInfo, gold?: number, currency?: string, amount?: number) => ({
	...genericAlertBuilder(AlertTypes.DONATION),
	from: sender.id,
	message: `${sender.name} has sent you ${gold ? `${gold.toFixed(2)} Gold` : ''} ${gold && currency ? ' and ' : ''} ${
		currency && amount ? `${amount.toFixed(2)} ${currency}` : ''
	}`,
})

export const buildSendFriendReqAlert = (sender: SenderInfo) => ({
	...genericAlertBuilder(AlertTypes.SEND_FR),
	from: sender.id,
	message: `You've received a friend request from ${sender.name}`,
})
