import {
	Alert,
	Company,
	Country,
	Friend,
	FundsBalance,
	InvItem,
	IpAddr,
	JobOffer,
	JobRecord,
	MsgThread,
	Newspaper,
	Party,
	PatriotDamage,
	PendingFriend,
	ProductOffer,
	RegionGeom,
	RegionNeighbor,
	StorageItem,
	Unit,
	WalletBalance,
} from '@prisma/client'

export interface IMsgThread {
	id: number
	read: boolean
	subject: string
	participants: {
		id: number
		username: string
		image: string
	}[]
	messages: {
		id: number
		threadId: number
		from: number
		content: string
		timestamp: Date
	}[]
	timestamp: Date
}

export interface IAlert {
	id: number
	read: boolean
	type: string
	message: string
	from?: number
	timestamp: Date
	toId: number
}

export interface IUser {
	id: number
	username: string
	email?: string
	password?: string
	image: string
	createdOn: Date
	description: string
	level: number
	xp: number
	health: number
	country?: Country
	countryId: number
	gold: number
	strength: number
	militaryRank: number
	totalDmg: number
	patriotDmg?: PatriotDamage[]
	location?: IRegion
	locationId: number
	residence?: IRegion
	residenceId: number
	job?: Company
	jobId: number
	party?: Party
	partyId: number
	unit?: Unit
	unitId: number
	newspaper?: Newspaper
	newsId: number
	canTrain: Date
	canWork: Date
	canCollectRewards: Date
	wallet?: WalletBalance[]
	inventory?: InvItem[]
	alerts?: Alert[]
	messages?: MsgThread[]
	pendingFriends?: PendingFriend[]
	friends?: IFriend[]
	ipAddrs?: IpAddr[]
	banned: boolean
	superSoldier: number
}

export interface IRegion {
	id: number
	name: string
	resource: number
	core?: Country
	coreId: number
	owner?: Country
	ownerId: number
	players?: IUser[]
	residents?: IUser[]
	companies?: Company[]
	borders?: RegionGeom[]
	neighbors?: RegionNeighbor[]
}

export interface IWalletInfo {
	id: number
	amount: number
	currency: {
		code: string
		country: {
			flagCode: true
		}
	}
}

export interface IActivities {
	jobInfo:
		| (JobRecord & {
				comp: {
					id: number
					ceoId: number
					image: string
					name: string
				}
		  })
		| null
	newsInfo: Newspaper | null
	partyInfo: Party | null
	unitInfo: Unit | null
}

export type IFriend = Friend & {
	user: {
		id: number
		username: string
		image: string
	}
}

export type GenericItem = Omit<InvItem | StorageItem, 'comp' | 'compId' | 'user' | 'userId'>

export interface ICompany {
	id: number
	name: string
	image: string
	type: number
	ceo?: IUser
	ceoId: number
	location?: IRegion
	locationId: number
	gold: string
	funds?: FundsBalance[]
	inventory?: StorageItem[]
	employees?: IJobRecord[]
	productOffers?: ProductOffer[]
	jobOffers?: JobOffer[]
}

export interface IJobRecord {
	id: number
	comp?: ICompany
	compId: number
	user?: { username: string; image: string }
	userId: number
	title: string
	wage: string
}
